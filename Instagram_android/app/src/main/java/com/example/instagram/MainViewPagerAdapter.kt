package com.example.instagram

import android.support.v4.app.Fragment
import android.support.v4.app.FragmentManager
import android.support.v4.app.FragmentStatePagerAdapter
import com.example.instagram.fragment.AddFragment
import com.example.instagram.fragment.HomeFragment
import com.example.instagram.fragment.MyPageFragment

class MainViewPagerAdapter (fm : FragmentManager, val fCount : Int): FragmentStatePagerAdapter(fm){

    override fun getItem(position: Int): Fragment? {
        when(position){
            0 -> return HomeFragment.newInstance()
            1 -> return AddFragment.newInstance()
            2 -> return MyPageFragment.newInstance()
            else -> return null
        }
    }

    override fun getCount(): Int = fCount //return fCount
}