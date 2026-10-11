package com.example.ui

import android.app.Application
import android.content.Context
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.api.OpenWeatherApi
import com.example.data.model.ForecastDay
import com.example.data.model.ForecastResponse
import com.example.data.model.WeatherResponse
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import retrofit2.HttpException
import java.io.IOException
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone
import kotlin.math.roundToInt

enum class ErrorType {
  EMPTY_INPUT,
  CITY_NOT_FOUND,
  INVALID_API_KEY,
  MISSING_API_KEY,
  RATE_LIMIT,
  NETWORK_ERROR,
  GENERAL_ERROR
}

sealed interface WeatherUiState {
  data object Idle : WeatherUiState
  data class Loading(val city: String) : WeatherUiState
  data class Success(
    val weather: WeatherResponse,
    val forecast: List<ForecastDay> = emptyList()
  ) : WeatherUiState
  data class Error(val message: String, val type: ErrorType) : WeatherUiState
}

data class WeatherScreenState(
  val uiState: WeatherUiState = WeatherUiState.Idle,
  val searchQuery: String = "",
  val apiKey: String = "",
  val searchHistory: List<String> = emptyList(),
  val showApiKeyDialog: Boolean = false
)

class WeatherViewModel(application: Application) : AndroidViewModel(application) {

  private val prefs = application.getSharedPreferences("weather_app_prefs", Context.MODE_PRIVATE)
  private val api = OpenWeatherApi.create()

  private val _state = MutableStateFlow(WeatherScreenState())
  val state: StateFlow<WeatherScreenState> = _state.asStateFlow()

  init {
    val savedKey = prefs.getString("openweather_api_key", "") ?: ""
    _state.update { it.copy(apiKey = savedKey) }
  }

  fun onSearchQueryChange(query: String) {
    _state.update { it.copy(searchQuery = query) }
  }

  fun setShowApiKeyDialog(show: Boolean) {
    _state.update { it.copy(showApiKeyDialog = show) }
  }

  fun saveApiKey(newKey: String) {
    val trimmed = newKey.trim()
    prefs.edit().putString("openweather_api_key", trimmed).apply()
    _state.update { it.copy(apiKey = trimmed, showApiKeyDialog = false) }

    val currentQuery = _state.value.searchQuery.trim()
    if (currentQuery.isNotEmpty()) {
      searchCity(currentQuery)
    }
  }

  fun searchCity(cityName: String) {
    val query = cityName.trim()
    if (query.isEmpty()) {
      _state.update {
        it.copy(
          uiState = WeatherUiState.Error(
            message = "Please enter a city name.",
            type = ErrorType.EMPTY_INPUT
          )
        )
      }
      return
    }

    val activeKey = _state.value.apiKey.trim()
    if (activeKey.isEmpty()) {
      _state.update {
        it.copy(
          uiState = WeatherUiState.Error(
            message = "Please provide an OpenWeather API key to fetch live data.",
            type = ErrorType.MISSING_API_KEY
          ),
          showApiKeyDialog = true
        )
      }
      return
    }

    _state.update {
      it.copy(
        searchQuery = query,
        uiState = WeatherUiState.Loading(city = query)
      )
    }

    viewModelScope.launch {
      try {
        val weatherResponse = api.getCurrentWeather(
          cityName = query,
          units = "metric",
          apiKey = activeKey
        )

        val forecastList = try {
          val forecastResponse = api.getForecast(
            cityName = query,
            units = "metric",
            apiKey = activeKey
          )
          processForecast(forecastResponse)
        } catch (_: Exception) {
          emptyList()
        }

        val currentHistory = _state.value.searchHistory.toMutableList()
        currentHistory.remove(weatherResponse.name)
        currentHistory.add(0, weatherResponse.name)
        if (currentHistory.size > 5) {
          currentHistory.removeAt(currentHistory.lastIndex)
        }

        _state.update {
          it.copy(
            uiState = WeatherUiState.Success(
              weather = weatherResponse,
              forecast = forecastList
            ),
            searchHistory = currentHistory
          )
        }
      } catch (e: HttpException) {
        val errorType = when (e.code()) {
          404 -> ErrorType.CITY_NOT_FOUND
          401 -> ErrorType.INVALID_API_KEY
          429 -> ErrorType.RATE_LIMIT
          else -> ErrorType.GENERAL_ERROR
        }
        val message = when (e.code()) {
          404 -> "City not found. Please check the spelling and try again."
          401 -> "Invalid or unauthorized API key. Please check your OpenWeather API key."
          429 -> "API rate limit reached. Please wait a few moments and try again."
          else -> "Unable to retrieve weather information. Please try again."
        }
        _state.update {
          it.copy(uiState = WeatherUiState.Error(message = message, type = errorType))
        }
      } catch (e: IOException) {
        _state.update {
          it.copy(
            uiState = WeatherUiState.Error(
              message = "Network error. Please check your internet connection and try again.",
              type = ErrorType.NETWORK_ERROR
            )
          )
        }
      } catch (e: Exception) {
        _state.update {
          it.copy(
            uiState = WeatherUiState.Error(
              message = e.localizedMessage ?: "Unable to retrieve weather information. Please try again.",
              type = ErrorType.GENERAL_ERROR
            )
          )
        }
      }
    }
  }

  private fun processForecast(response: ForecastResponse): List<ForecastDay> {
    val tz = response.city?.timezone ?: 0L
    val dateKeyFormat = SimpleDateFormat("yyyy-MM-dd", Locale.US).apply {
      timeZone = TimeZone.getTimeZone("UTC")
    }
    val dayNameFormat = SimpleDateFormat("EEE", Locale.US).apply {
      timeZone = TimeZone.getTimeZone("UTC")
    }
    val formattedDateFormat = SimpleDateFormat("MMM d", Locale.US).apply {
      timeZone = TimeZone.getTimeZone("UTC")
    }

    val grouped = response.list.groupBy { item ->
      val d = Date((item.dt + tz) * 1000)
      dateKeyFormat.format(d)
    }

    return grouped.keys.sorted().take(5).map { dateKey ->
      val items = grouped[dateKey] ?: emptyList()
      val minT = items.minOfOrNull { it.main.tempMin } ?: 0.0
      val maxT = items.maxOfOrNull { it.main.tempMax } ?: 0.0

      val rep = items.find { item ->
        val hour = (Date((item.dt + tz) * 1000).time / (1000 * 60 * 60)) % 24
        hour in 11..15
      } ?: items.getOrNull(items.size / 2) ?: items.first()

      val repDate = Date((rep.dt + tz) * 1000)
      val dayName = dayNameFormat.format(repDate)
      val formattedDate = formattedDateFormat.format(repDate)
      val weatherDesc = rep.weather.firstOrNull()

      ForecastDay(
        date = dateKey,
        dayName = dayName,
        formattedDate = formattedDate,
        tempMax = maxT.roundToInt(),
        tempMin = minT.roundToInt(),
        condition = weatherDesc?.main ?: "Clear",
        description = weatherDesc?.description ?: "",
        icon = weatherDesc?.icon ?: "01d"
      )
    }
  }
}
