package com.example.data.model

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class WeatherResponse(
  val id: Long? = null,
  val name: String = "",
  val coord: Coord? = null,
  val weather: List<WeatherDescription> = emptyList(),
  val main: MainMetrics = MainMetrics(),
  val visibility: Int? = null,
  val wind: WindMetrics? = null,
  val sys: SysInfo? = null,
  val dt: Long? = null
)

@JsonClass(generateAdapter = true)
data class Coord(
  val lon: Double = 0.0,
  val lat: Double = 0.0
)

@JsonClass(generateAdapter = true)
data class WeatherDescription(
  val id: Int = 0,
  val main: String = "",
  val description: String = "",
  val icon: String = ""
)

@JsonClass(generateAdapter = true)
data class MainMetrics(
  val temp: Double = 0.0,
  @field:Json(name = "feels_like") val feelsLike: Double = 0.0,
  @field:Json(name = "temp_min") val tempMin: Double = 0.0,
  @field:Json(name = "temp_max") val tempMax: Double = 0.0,
  val pressure: Int = 0,
  val humidity: Int = 0
)

@JsonClass(generateAdapter = true)
data class WindMetrics(
  val speed: Double = 0.0,
  val deg: Int? = null
)

@JsonClass(generateAdapter = true)
data class SysInfo(
  val country: String? = null,
  val sunrise: Long? = null,
  val sunset: Long? = null
)

@JsonClass(generateAdapter = true)
data class ForecastResponse(
  val list: List<ForecastItem> = emptyList(),
  val city: CityInfo? = null
)

@JsonClass(generateAdapter = true)
data class ForecastItem(
  val dt: Long = 0,
  val main: MainMetrics = MainMetrics(),
  val weather: List<WeatherDescription> = emptyList(),
  @field:Json(name = "dt_txt") val dtTxt: String? = null
)

@JsonClass(generateAdapter = true)
data class CityInfo(
  val timezone: Long = 0
)

data class ForecastDay(
  val date: String = "",
  val dayName: String = "",
  val formattedDate: String = "",
  val tempMax: Int = 0,
  val tempMin: Int = 0,
  val condition: String = "",
  val description: String = "",
  val icon: String = ""
)
