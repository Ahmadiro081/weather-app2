package com.example.data.api

import com.example.data.model.WeatherResponse
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import retrofit2.http.GET
import retrofit2.http.Query
import java.util.concurrent.TimeUnit

interface OpenWeatherApi {
  @GET("data/2.5/weather")
  suspend fun getCurrentWeather(
    @Query("q") cityName: String,
    @Query("units") units: String = "metric",
    @Query("appid") apiKey: String
  ): WeatherResponse

  @GET("data/2.5/forecast")
  suspend fun getForecast(
    @Query("q") cityName: String,
    @Query("units") units: String = "metric",
    @Query("appid") apiKey: String
  ): com.example.data.model.ForecastResponse

  companion object {
    private const val BASE_URL = "https://api.openweathermap.org/"

    fun create(): OpenWeatherApi {
      val logging = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BASIC
      }

      val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(logging)
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .build()

      val moshi = Moshi.Builder()
        .add(KotlinJsonAdapterFactory())
        .build()

      return Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(MoshiConverterFactory.create(moshi))
        .build()
        .create(OpenWeatherApi::class.java)
    }
  }
}
