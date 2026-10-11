package com.example.ui

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.TrendingUp
import androidx.compose.material.icons.filled.Air
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Compress
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.ErrorOutline
import androidx.compose.material.icons.filled.Key
import androidx.compose.material.icons.filled.LocationCity
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.WaterDrop
import androidx.compose.material.icons.filled.WbSunny
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil.compose.AsyncImage
import com.example.data.model.WeatherResponse
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlin.math.roundToInt

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun WeatherScreen(viewModel: WeatherViewModel) {
  val state by viewModel.state.collectAsStateWithLifecycle()
  val focusManager = LocalFocusManager.current

  Scaffold(
    topBar = {
      CenterAlignedTopAppBar(
        title = {
          Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
          ) {
            Surface(
              shape = RoundedCornerShape(8.dp),
              color = MaterialTheme.colorScheme.primaryContainer,
              modifier = Modifier.size(32.dp)
            ) {
              Box(contentAlignment = Alignment.Center) {
                Icon(
                  imageVector = Icons.Default.WbSunny,
                  contentDescription = "Weather Icon",
                  tint = MaterialTheme.colorScheme.primary,
                  modifier = Modifier.size(20.dp)
                )
              }
            }
            Text(
              text = "Weather App",
              style = MaterialTheme.typography.titleMedium,
              fontWeight = FontWeight.Bold
            )
            Surface(
              shape = CircleShape,
              color = MaterialTheme.colorScheme.secondaryContainer,
              modifier = Modifier.padding(start = 4.dp)
            ) {
              Text(
                text = "MINI-PROJECT",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSecondaryContainer,
                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                fontWeight = FontWeight.SemiBold
              )
            }
          }
        },
        actions = {
          IconButton(
            onClick = { viewModel.setShowApiKeyDialog(true) },
            modifier = Modifier.testTag("api_key_settings_button")
          ) {
            Icon(
              imageVector = Icons.Default.Key,
              contentDescription = "API Key Settings",
              tint = if (state.apiKey.isEmpty()) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary
            )
          }
        },
        colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
          containerColor = MaterialTheme.colorScheme.surface
        )
      )
    }
  ) { innerPadding ->
    Column(
      modifier = Modifier
        .fillMaxSize()
        .padding(innerPadding)
        .verticalScroll(rememberScrollState()),
      horizontalAlignment = Alignment.CenterHorizontally
    ) {
      Column(
        modifier = Modifier
          .fillMaxWidth()
          .widthIn(max = 680.dp)
          .padding(horizontal = 16.dp, vertical = 12.dp),
        horizontalAlignment = Alignment.CenterHorizontally
      ) {
        // Hero subtitle
        Text(
          text = "Check real-time weather conditions in your city",
          style = MaterialTheme.typography.bodyMedium,
          color = MaterialTheme.colorScheme.onSurfaceVariant,
          textAlign = TextAlign.Center,
          modifier = Modifier.padding(bottom = 16.dp)
        )

        // API Key Warning Banner if not set
        if (state.apiKey.isEmpty()) {
          Card(
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer),
            modifier = Modifier
              .fillMaxWidth()
              .padding(bottom = 16.dp)
          ) {
            Row(
              modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
              verticalAlignment = Alignment.CenterVertically,
              horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
              Icon(
                imageVector = Icons.Default.ErrorOutline,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.error
              )
              Column(modifier = Modifier.weight(1f)) {
                Text(
                  text = "OpenWeather API Key Required",
                  style = MaterialTheme.typography.labelLarge,
                  fontWeight = FontWeight.Bold,
                  color = MaterialTheme.colorScheme.onErrorContainer
                )
                Text(
                  text = "Click to set your free key to enable live weather queries.",
                  style = MaterialTheme.typography.bodySmall,
                  color = MaterialTheme.colorScheme.onErrorContainer
                )
              }
              Button(
                onClick = { viewModel.setShowApiKeyDialog(true) },
                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error),
                shape = RoundedCornerShape(8.dp)
              ) {
                Text("Set Key", style = MaterialTheme.typography.labelMedium)
              }
            }
          }
        }

        // Search Card
        Card(
          shape = RoundedCornerShape(16.dp),
          colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)),
          modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = 16.dp)
        ) {
          Column(modifier = Modifier.padding(16.dp)) {
            Row(
              modifier = Modifier.fillMaxWidth(),
              verticalAlignment = Alignment.CenterVertically,
              horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
              OutlinedTextField(
                value = state.searchQuery,
                onValueChange = { viewModel.onSearchQueryChange(it) },
                placeholder = { Text("Enter city name (e.g. Abuja, Lagos)") },
                leadingIcon = {
                  Icon(imageVector = Icons.Default.Search, contentDescription = null)
                },
                trailingIcon = {
                  if (state.searchQuery.isNotEmpty()) {
                    IconButton(onClick = { viewModel.onSearchQueryChange("") }) {
                      Icon(imageVector = Icons.Default.Close, contentDescription = "Clear search")
                    }
                  }
                },
                singleLine = true,
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                keyboardActions = KeyboardActions(onSearch = {
                  focusManager.clearFocus()
                  viewModel.searchCity(state.searchQuery)
                }),
                modifier = Modifier
                  .weight(1f)
                  .testTag("city_input_field"),
                shape = RoundedCornerShape(12.dp)
              )

              Button(
                onClick = {
                  focusManager.clearFocus()
                  viewModel.searchCity(state.searchQuery)
                },
                enabled = state.uiState !is WeatherUiState.Loading,
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                  .height(56.dp)
                  .testTag("search_button")
              ) {
                if (state.uiState is WeatherUiState.Loading) {
                  CircularProgressIndicator(
                    modifier = Modifier.size(20.dp),
                    strokeWidth = 2.dp,
                    color = MaterialTheme.colorScheme.onPrimary
                  )
                } else {
                  Text("Search")
                }
              }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Quick Selection Label
            Text(
              text = "QUICK SELECTION (NIGERIAN CITIES)",
              style = MaterialTheme.typography.labelSmall,
              fontWeight = FontWeight.Bold,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Quick Selection Buttons: Abuja and Lagos (Prominent)
            FlowRow(
              horizontalArrangement = Arrangement.spacedBy(8.dp),
              verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
              Button(
                onClick = {
                  focusManager.clearFocus()
                  viewModel.onSearchQueryChange("Abuja")
                  viewModel.searchCity("Abuja")
                },
                shape = RoundedCornerShape(20.dp),
                modifier = Modifier.testTag("quick_btn_abuja")
              ) {
                Text("🏛️ Abuja")
              }

              Button(
                onClick = {
                  focusManager.clearFocus()
                  viewModel.onSearchQueryChange("Lagos")
                  viewModel.searchCity("Lagos")
                },
                shape = RoundedCornerShape(20.dp),
                modifier = Modifier.testTag("quick_btn_lagos")
              ) {
                Text("🌊 Lagos")
              }

              FilledTonalButton(
                onClick = {
                  focusManager.clearFocus()
                  viewModel.onSearchQueryChange("Kano")
                  viewModel.searchCity("Kano")
                },
                shape = RoundedCornerShape(20.dp)
              ) {
                Text("Kano")
              }

              FilledTonalButton(
                onClick = {
                  focusManager.clearFocus()
                  viewModel.onSearchQueryChange("Ibadan")
                  viewModel.searchCity("Ibadan")
                },
                shape = RoundedCornerShape(20.dp)
              ) {
                Text("Ibadan")
              }

              FilledTonalButton(
                onClick = {
                  focusManager.clearFocus()
                  viewModel.onSearchQueryChange("Port Harcourt")
                  viewModel.searchCity("Port Harcourt")
                },
                shape = RoundedCornerShape(20.dp)
              ) {
                Text("Port Harcourt")
              }
            }

            // Search History for current session
            if (state.searchHistory.isNotEmpty()) {
              Spacer(modifier = Modifier.height(12.dp))
              Text(
                text = "RECENT SEARCHES (THIS SESSION)",
                style = MaterialTheme.typography.labelSmall,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurfaceVariant
              )
              Spacer(modifier = Modifier.height(6.dp))
              FlowRow(
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                verticalArrangement = Arrangement.spacedBy(6.dp)
              ) {
                state.searchHistory.forEach { city ->
                  OutlinedButton(
                    onClick = {
                      focusManager.clearFocus()
                      viewModel.onSearchQueryChange(city)
                      viewModel.searchCity(city)
                    },
                    shape = RoundedCornerShape(16.dp)
                  ) {
                    Text(city, style = MaterialTheme.typography.labelSmall)
                  }
                }
              }
            }
          }
        }

        // Status Feedback: Loading State
        AnimatedVisibility(
          visible = state.uiState is WeatherUiState.Loading,
          enter = fadeIn(),
          exit = fadeOut()
        ) {
          Card(
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier
              .fillMaxWidth()
              .padding(bottom = 16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
          ) {
            Row(
              modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp),
              verticalAlignment = Alignment.CenterVertically,
              horizontalArrangement = Arrangement.Center
            ) {
              CircularProgressIndicator(modifier = Modifier.size(24.dp), strokeWidth = 2.5.dp)
              Spacer(modifier = Modifier.width(12.dp))
              Text(
                text = "Loading weather data...",
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Medium
              )
            }
          }
        }

        // Status Feedback: Error State
        AnimatedVisibility(
          visible = state.uiState is WeatherUiState.Error,
          enter = fadeIn(),
          exit = fadeOut()
        ) {
          val error = (state.uiState as? WeatherUiState.Error)
          if (error != null) {
            Card(
              shape = RoundedCornerShape(12.dp),
              modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 16.dp),
              colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer)
            ) {
              Row(
                modifier = Modifier
                  .fillMaxWidth()
                  .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
              ) {
                Icon(
                  imageVector = Icons.Default.ErrorOutline,
                  contentDescription = "Error",
                  tint = MaterialTheme.colorScheme.error
                )
                Text(
                  text = error.message,
                  style = MaterialTheme.typography.bodyMedium,
                  color = MaterialTheme.colorScheme.onErrorContainer
                )
              }
            }
          }
        }

        // Weather Data Card & 5-Day Forecast (Success State)
        AnimatedVisibility(
          visible = state.uiState is WeatherUiState.Success,
          enter = fadeIn() + scaleIn(initialScale = 0.96f),
          exit = fadeOut()
        ) {
          val success = (state.uiState as? WeatherUiState.Success)
          if (success != null) {
            Column {
              WeatherDetailCard(weather = success.weather)
              if (success.forecast.isNotEmpty()) {
                ForecastSectionCard(forecast = success.forecast)
              }
            }
          }
        }

        // Initial Placeholder Card (Idle State)
        if (state.uiState is WeatherUiState.Idle) {
          Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            modifier = Modifier
              .fillMaxWidth()
              .padding(bottom = 16.dp)
          ) {
            Column(
              modifier = Modifier
                .fillMaxWidth()
                .padding(32.dp),
              horizontalAlignment = Alignment.CenterHorizontally,
              verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
              Icon(
                imageVector = Icons.Default.LocationCity,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(54.dp)
              )
              Text(
                text = "Ready to check the weather?",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
              )
              Text(
                text = "Click Abuja or Lagos above, or enter any municipality name to retrieve real-time atmospheric data.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center
              )
            }
          }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Required Academic Footer
        Text(
          text = "Weather App | Undergraduate Application Development Mini Project",
          style = MaterialTheme.typography.bodySmall,
          color = MaterialTheme.colorScheme.onSurfaceVariant,
          textAlign = TextAlign.Center,
          modifier = Modifier.padding(bottom = 16.dp)
        )
      }
    }
  }

  // API Key Settings Dialog
  if (state.showApiKeyDialog) {
    ApiKeyConfigDialog(
      currentKey = state.apiKey,
      onDismiss = { viewModel.setShowApiKeyDialog(false) },
      onSave = { viewModel.saveApiKey(it) }
    )
  }
}

@Composable
fun WeatherDetailCard(weather: WeatherResponse) {
  val weatherDesc = weather.weather.firstOrNull()
  val countryCode = weather.sys?.country ?: ""
  val countryName = when (countryCode) {
    "NG" -> "Nigeria"
    "GH" -> "Ghana"
    "KE" -> "Kenya"
    "ZA" -> "South Africa"
    "GB" -> "United Kingdom"
    "US" -> "United States"
    else -> countryCode
  }

  val dateFormatted = remember {
    SimpleDateFormat("EEEE, MMMM d, yyyy", Locale.getDefault()).format(Date())
  }

  Card(
    shape = RoundedCornerShape(20.dp),
    modifier = Modifier
      .fillMaxWidth()
      .padding(bottom = 16.dp)
      .testTag("weather_card"),
    elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
  ) {
    Column {
      // Header Banner
      Box(
        modifier = Modifier
          .fillMaxWidth()
          .background(
            Brush.horizontalGradient(
              colors = listOf(
                MaterialTheme.colorScheme.primary,
                MaterialTheme.colorScheme.primary.copy(alpha = 0.85f)
              )
            )
          )
          .padding(20.dp)
      ) {
        Column {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Column {
              Text(
                text = weather.name,
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.ExtraBold,
                color = MaterialTheme.colorScheme.onPrimary
              )
              if (countryName.isNotEmpty()) {
                Text(
                  text = countryName,
                  style = MaterialTheme.typography.titleMedium,
                  color = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.9f)
                )
              }
            }
            Surface(
              shape = RoundedCornerShape(12.dp),
              color = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.2f)
            ) {
              Text(
                text = "REAL-TIME",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onPrimary,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
              )
            }
          }
          Spacer(modifier = Modifier.height(4.dp))
          Text(
            text = dateFormatted,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.75f)
          )
        }
      }

      // Primary Weather: Temperature & Condition Icon
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .padding(20.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Column {
          Row(verticalAlignment = Alignment.Top) {
            Text(
              text = "${weather.main.temp.roundToInt()}",
              fontSize = 58.sp,
              fontWeight = FontWeight.Black,
              lineHeight = 60.sp,
              color = MaterialTheme.colorScheme.onSurface
            )
            Text(
              text = "°C",
              fontSize = 28.sp,
              fontWeight = FontWeight.Bold,
              color = MaterialTheme.colorScheme.primary,
              modifier = Modifier.padding(top = 4.dp)
            )
          }
          Text(
            text = "Feels Like: ${weather.main.feelsLike.roundToInt()}°C",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
          )
        }

        Column(
          horizontalAlignment = Alignment.CenterHorizontally
        ) {
          val iconCode = weatherDesc?.icon ?: "01d"
          val iconUrl = "https://openweathermap.org/img/wn/$iconCode@2x.png"

          AsyncImage(
            model = iconUrl,
            contentDescription = weatherDesc?.description ?: "Weather condition icon",
            modifier = Modifier.size(76.dp)
          )

          Text(
            text = weatherDesc?.main ?: "Clear",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold
          )
          Text(
            text = weatherDesc?.description?.replaceFirstChar { it.uppercase() } ?: "",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
          )
        }
      }

      // Metrics Grid: 4 Cards
      Column(
        modifier = Modifier
          .fillMaxWidth()
          .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.35f))
          .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
      ) {
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
          MetricItem(
            icon = Icons.Default.WaterDrop,
            label = "Humidity",
            value = "${weather.main.humidity}%",
            modifier = Modifier.weight(1f)
          )
          MetricItem(
            icon = Icons.Default.Air,
            label = "Wind Speed",
            value = String.format(Locale.US, "%.1f m/s", weather.wind?.speed ?: 0.0),
            modifier = Modifier.weight(1f)
          )
        }
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
          MetricItem(
            icon = Icons.Default.Compress,
            label = "Pressure",
            value = "${weather.main.pressure} hPa",
            modifier = Modifier.weight(1f)
          )
          val visKm = weather.visibility?.let { String.format(Locale.US, "%.1f km", it / 1000.0) } ?: "N/A"
          MetricItem(
            icon = Icons.Default.Visibility,
            label = "Visibility",
            value = visKm,
            modifier = Modifier.weight(1f)
          )
        }
      }
    }
  }
}

@Composable
fun MetricItem(
  icon: ImageVector,
  label: String,
  value: String,
  modifier: Modifier = Modifier
) {
  Card(
    shape = RoundedCornerShape(12.dp),
    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
    elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
    modifier = modifier
  ) {
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .padding(12.dp),
      verticalAlignment = Alignment.CenterVertically,
      horizontalArrangement = Arrangement.spacedBy(10.dp)
    ) {
      Surface(
        shape = RoundedCornerShape(8.dp),
        color = MaterialTheme.colorScheme.primaryContainer,
        modifier = Modifier.size(36.dp)
      ) {
        Box(contentAlignment = Alignment.Center) {
          Icon(
            imageVector = icon,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.primary,
            modifier = Modifier.size(20.dp)
          )
        }
      }
      Column {
        Text(
          text = label.uppercase(),
          style = MaterialTheme.typography.labelSmall,
          color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Text(
          text = value,
          style = MaterialTheme.typography.bodyLarge,
          fontWeight = FontWeight.Bold
        )
      }
    }
  }
}

@Composable
fun ForecastSectionCard(forecast: List<com.example.data.model.ForecastDay>) {
  Card(
    shape = RoundedCornerShape(20.dp),
    modifier = Modifier
      .fillMaxWidth()
      .padding(bottom = 16.dp),
    elevation = CardDefaults.cardElevation(defaultElevation = 3.dp),
    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
  ) {
    Column(modifier = Modifier.padding(16.dp)) {
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
          Icon(
            imageVector = Icons.Default.DateRange,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.primary,
            modifier = Modifier.size(22.dp)
          )
          Text(
            text = "5-Day Weather Forecast",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold
          )
        }
        Surface(
          shape = CircleShape,
          color = MaterialTheme.colorScheme.primaryContainer
        ) {
          Text(
            text = "High / Low",
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onPrimaryContainer,
            fontWeight = FontWeight.SemiBold,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
          )
        }
      }

      Spacer(modifier = Modifier.height(14.dp))

      Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        forecast.forEach { day ->
          Surface(
            shape = RoundedCornerShape(12.dp),
            color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.45f),
            modifier = Modifier.fillMaxWidth()
          ) {
            Row(
              modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 14.dp, vertical = 10.dp),
              verticalAlignment = Alignment.CenterVertically,
              horizontalArrangement = Arrangement.SpaceBetween
            ) {
              Column(modifier = Modifier.width(76.dp)) {
                Text(
                  text = day.dayName,
                  style = MaterialTheme.typography.bodyMedium,
                  fontWeight = FontWeight.Bold
                )
                Text(
                  text = day.formattedDate,
                  style = MaterialTheme.typography.labelSmall,
                  color = MaterialTheme.colorScheme.onSurfaceVariant
                )
              }

              Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                modifier = Modifier.weight(1f)
              ) {
                val iconUrl = "https://openweathermap.org/img/wn/${day.icon}@2x.png"
                AsyncImage(
                  model = iconUrl,
                  contentDescription = day.description,
                  modifier = Modifier.size(36.dp)
                )
                Text(
                  text = day.condition,
                  style = MaterialTheme.typography.bodySmall,
                  color = MaterialTheme.colorScheme.onSurface
                )
              }

              Surface(
                shape = RoundedCornerShape(16.dp),
                color = MaterialTheme.colorScheme.surface
              ) {
                Row(
                  modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp),
                  verticalAlignment = Alignment.CenterVertically,
                  horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                  Text(
                    text = "${day.tempMax}°C",
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.ExtraBold,
                    color = Color(0xFFDC2626)
                  )
                  Text(
                    text = "/",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.outline
                  )
                  Text(
                    text = "${day.tempMin}°C",
                    style = MaterialTheme.typography.bodySmall,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.primary
                  )
                }
              }
            }
          }
        }
      }
    }
  }
}

@Composable
fun ApiKeyConfigDialog(
  currentKey: String,
  onDismiss: () -> Unit,
  onSave: (String) -> Unit
) {
  var keyInput by remember { mutableStateOf(currentKey) }

  AlertDialog(
    onDismissRequest = onDismiss,
    title = {
      Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp)
      ) {
        Icon(imageVector = Icons.Default.Key, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
        Text("OpenWeather API Key")
      }
    },
    text = {
      Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text(
          text = "To query real-time meteorological conditions, enter your 32-character OpenWeather API key.",
          style = MaterialTheme.typography.bodySmall
        )
        OutlinedTextField(
          value = keyInput,
          onValueChange = { keyInput = it },
          placeholder = { Text("32-character key") },
          singleLine = true,
          modifier = Modifier.fillMaxWidth(),
          shape = RoundedCornerShape(8.dp)
        )
        Text(
          text = "Free key available at openweathermap.org/api",
          style = MaterialTheme.typography.labelSmall,
          color = MaterialTheme.colorScheme.primary
        )
      }
    },
    confirmButton = {
      Button(onClick = { onSave(keyInput) }) {
        Text("Save Key")
      }
    },
    dismissButton = {
      TextButton(onClick = onDismiss) {
        Text("Cancel")
      }
    }
  )
}
