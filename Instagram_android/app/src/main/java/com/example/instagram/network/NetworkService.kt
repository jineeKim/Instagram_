package com.example.instagram.network

import retrofit2.Call
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.*

interface NetworkService {
    //이미지 검색
//    @GET("/v2/search/image")
//    fun getSearchImage(
//        @Header("Authorization") authorization : String,
//        @Query("query") query : String,
//        @Query("sort") sort : String
//
//    ): Call<SearchImageResponse>


    companion object {
        private const val BASE_URL = ""

        fun create(): NetworkService {
            return Retrofit.Builder()
                .baseUrl(BASE_URL)
                .addConverterFactory(GsonConverterFactory.create())
                .build()
                .create(NetworkService::class.java)
        }
    }
}