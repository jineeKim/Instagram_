package com.example.instagram

import android.support.v7.app.AppCompatActivity
import android.os.Bundle
import android.view.View
import android.widget.RelativeLayout
import kotlinx.android.synthetic.main.activity_main.*
import org.jetbrains.anko.longToast

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        init()
        configureBottomNavigation()
    }

    private fun init() {
        setSupportActionBar(act_main_toolbar)
        supportActionBar!!.title = ""
        supportActionBar!!.setLogo(R.drawable.instagram_logo)
    }

    private fun configureBottomNavigation() {
        act_main_vp_bottom_navi.adapter = MainViewPagerAdapter(supportFragmentManager, 3) //3개를 고정시키겠다.
        //vp_bottom_navi_act_frag_pager.offscreenPageLimit = 3
        // ViewPager와 Tablayout을 엮어줍니다!
        act_main_tl_bottom_navi.setupWithViewPager(act_main_vp_bottom_navi)
        //TabLayout에 붙일 layout을 찾아준 다음
        val bottomNaviLayout: View = this.layoutInflater.inflate(R.layout.bottom_navigation_tab, null, false)
        //탭 하나하나 TabLayout에 연결시켜줍니다.
        act_main_tl_bottom_navi.getTabAt(0)!!.customView = bottomNaviLayout.findViewById(R.id.bottom_navigation_rl_home) as RelativeLayout
        act_main_tl_bottom_navi.getTabAt(1)!!.customView = bottomNaviLayout.findViewById(R.id.bottom_navigation_rl_add) as RelativeLayout
        act_main_tl_bottom_navi.getTabAt(2)!!.customView = bottomNaviLayout.findViewById(R.id.bottom_navigation_rl_mypage) as RelativeLayout

    }
}

