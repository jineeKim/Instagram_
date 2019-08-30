package com.example.instagram.fragment

import android.content.Intent
import android.os.Bundle
import android.support.v4.app.Fragment
import android.support.v7.widget.GridLayoutManager
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import com.example.instagram.HomeRecyclerViewAdapter
import com.example.instagram.R
import com.example.instagram.network.NetworkService
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class HomeFragment: Fragment() {
    private lateinit var rootView: View
    private val api: NetworkService = NetworkService.create()


    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        rootView = inflater.inflate(R.layout.fragment_home, container, false)
        return rootView
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        loadData()

    }


    private fun setRecyclerView() {
        val homeRecyclerViewAdapter = HomeRecyclerViewAdapter(activity!!, homeDataList)
        frag_home_rv_contents.adapter = homeRecyclerViewAdapter
        frag_home_rv_contents.layoutManager = GridLayoutManager(activity, 2)
        homeRecyclerViewAdapter.setOnItemClickListener(this)
    }


    private fun loadData() {
        val getKeywordResponse = api.getKeyword()
        getKeywordResponse.enqueue(object : Callback<KeywordResponse> {
            override fun onFailure(call: Call<KeywordResponse>, t: Throwable) {
            }

            override fun onResponse(call: Call<KeywordResponse>, response: Response<KeywordResponse>) {
                if (response.isSuccessful) {
                    homeDataList.addAll(response.body()!!.data)
                    setRecyclerView()
                }
            }
        })
    }

    companion object {
        fun newInstance(): HomeFragment {
            return HomeFragment()
        }
    }
}