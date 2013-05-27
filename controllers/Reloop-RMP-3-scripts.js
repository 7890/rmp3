/****************************************************************/
/*      Reloop RMP-3 Cross Media Player controller script v1.0  */
/*      Copyright (C) 2013, Thomas Brand                        */
/*      Feel free to tweak!                                     */
/*      Works best with Mixxx version 1.11.x                    */
/*      Overview on Bindings:  http://lowres.ch/rmp3/index.html */
/****************************************************************/

//tb/130407/130520

function RMP3() {}

RMP3.ledOn = 0x7F;
RMP3.ledOff = 0x00;

RMP3.keyPressed = 0x7F;
RMP3.keyUp = 0x00;

//pitch range of fader 4 - 100%
RMP3.rateRange=new Array(4);
RMP3.rateRange[0]=0.04;
RMP3.rateRange[1]=0.08;
RMP3.rateRange[2]=0.16;
RMP3.rateRange[3]=1.00;

RMP3.currentRateRange=new Array(2);
RMP3.currentRateRange[0]=1;
RMP3.currentRateRange[1]=1;

RMP3.scratchMode = new Array(2);
RMP3.scratchMode[0] = 0;
RMP3.scratchMode[1] = 0;

//1 (fast) - 3 (slow)
//used for jog scratch and loop nudge
RMP3.sensitivity = new Array(2);
RMP3.sensitivity[0]=1;
RMP3.sensitivity[1]=1;

//0: none, 1: start, 2: end
RMP3.nudgeMode = new Array(2)
RMP3.nudgeMode[0]=0;
RMP3.nudgeMode[1]=0;

RMP3.init = function(id)
{
    	print ("Initalizing Reloop RMP-3...");

	//reset all indications
	RMP3.resetLEDs("[Channel1]");
	RMP3.resetLEDs("[Channel2]");

	RMP3.connectEvents("[Channel1]");
	RMP3.connectEvents("[Channel2]");

	//engine.connectControl("[Channel1]","pfl","RMP3.OnPFL_Button1");

	RMP3.setInitialValues("[Channel1]");
	RMP3.setInitialValues("[Channel2]");

	print("RPM-3 READY.");

} //end RMP3.init

RMP3.setInitialValues = function(group)
{
	var index=RMP3.getIndex_(group);

	//read current states to initially set indications
	//+/- 8%
	engine.setValue(group,"rateRange",RMP3.rateRange[RMP3.currentRateRange[index]]);
	engine.setValue(group,"rate_dir",-1);

	//turn on defaults
	//pitch 8%
	RMP3.led_(RMP3.iface.pitch_8,1,group);

	//sensitivity 1
	RMP3.led_(RMP3.iface.flanger,1,group);

	if(engine.getValue(group,"play"))
	{
		RMP3.led_(RMP3.iface.play_pause,1,group);
	}
	if(engine.getValue(group,"filterHighKill"))
	{
		RMP3.led_(RMP3.iface.b1_1,1,group);
	}
	if(engine.getValue(group,"filterMidKill"))
	{
		RMP3.led_(RMP3.iface.b2_1,1,group);
	}
	if(engine.getValue(group,"filterLowKill"))
	{
		RMP3.led_(RMP3.iface.b4_1,1,group);
	}
	if(engine.getValue(group,"keylock"))
	{
		RMP3.led_(RMP3.iface.keylock,1,group);
	}
	if(engine.getValue(group,"repeat"))
	{
		RMP3.led_(RMP3.iface.skid,1,group);
	}
	if(engine.getValue(group,"quantize"))
	{
		RMP3.led_(RMP3.iface.phase,1,group);
	}
	if(engine.getValue(group,"hotcue_1_enabled"))
	{
		RMP3.led_(RMP3.iface._1,1,group);
	}
	if(engine.getValue(group,"hotcue_2_enabled"))
	{
		RMP3.led_(RMP3.iface._2,1,group);
	}
	if(engine.getValue(group,"hotcue_3_enabled"))
	{
		RMP3.led_(RMP3.iface._3,1,group);
	}
	if(engine.getValue(group,"hotcue_4_enabled"))
	{
		RMP3.led_(RMP3.iface._4,1,group);
	}
	if(engine.getValue(group,"loop_enabled"))
	{
		RMP3.led_(RMP3.iface.loop_in,1,group);
		RMP3.led_(RMP3.iface.loop_out,1,group);
	}

} //end RMP3.setInitialValues

RMP3.connectEvents = function(group)
{
	//connect to events
	engine.connectControl(group,"play","RMP3.isChannel_Playing");
	engine.connectControl(group,"cue_default","RMP3.isChannel_Cue_Active");

	engine.connectControl(group,"filterHighKill","RMP3.OnFilterHigh_KillButton");
	engine.connectControl(group,"filterMidKill","RMP3.OnFilterMid_KillButton");
	engine.connectControl(group,"filterLowKill","RMP3.OnFilterLow_KillButton");

	engine.connectControl(group,"keylock","RMP3.OnKeyLockChange");
	engine.connectControl(group,"repeat","RMP3.OnRepeat");
	engine.connectControl(group,"quantize","RMP3.OnQuantize");
	engine.connectControl(group,"beats_translate_curpos","RMP3.OnAdjustBeatgrid");

	engine.connectControl(group,"hotcue_1_enabled","RMP3.OnHotcue1_1");
	engine.connectControl(group,"hotcue_2_enabled","RMP3.OnHotcue1_2");
	engine.connectControl(group,"hotcue_3_enabled","RMP3.OnHotcue1_3");
	engine.connectControl(group,"hotcue_4_enabled","RMP3.OnHotcue1_4");

	engine.connectControl(group,"loop_enabled","RMP3.OnLoopEnabled");
	//engine.connectControl(group,"beat_active","RMP3.OnBeatActive");
} //end RMP3.connectEvents

RMP3.resetLEDs = function(group)
{
	//Turn all LEDS off 

	RMP3.led_(RMP3.iface.play_pause,0,group);
	RMP3.led_(RMP3.iface.cue,0,group);

	RMP3.led_(RMP3.iface.loop_in,0,group);
	RMP3.led_(RMP3.iface.loop_out,0,group);

	RMP3.led_(RMP3.iface.b1_1,0,group);
	RMP3.led_(RMP3.iface.b2_1,0,group);
	RMP3.led_(RMP3.iface.b4_1,0,group);
	RMP3.led_(RMP3.iface._1,0,group);
	RMP3.led_(RMP3.iface._2,0,group);
	RMP3.led_(RMP3.iface._3,0,group);
	RMP3.led_(RMP3.iface._4,0,group);

	RMP3.led_(RMP3.iface.scratch,0,group);
	RMP3.led_(RMP3.iface.skid,0,group);
	RMP3.led_(RMP3.iface.scratch,0,group);	
	RMP3.led_(RMP3.iface.phase,0,group);

	RMP3.led_(RMP3.iface.pitch_4,0,group);
	RMP3.led_(RMP3.iface.pitch_8,0,group);
	RMP3.led_(RMP3.iface.pitch_16,0,group);	
	RMP3.led_(RMP3.iface.pitch_100,0,group);

	RMP3.led_(RMP3.iface.keylock,0,group);
	RMP3.led_(RMP3.iface.pitch0,0,group);

	RMP3.led_(RMP3.iface.flanger,0,group);
	RMP3.led_(RMP3.iface.trans,0,group);
	RMP3.led_(RMP3.iface.pan,0,group);
} //end RMP3.resetLEDs

RMP3.shutdown = function(id)
{
	//Turn all LEDs off by using init function
	RMP3.resetLEDs("[Channel1]");
	RMP3.resetLEDs("[Channel2]");
}

RMP3.nudgeLoopStart = function (channel, control, value, status, group)
{
	var index=RMP3.getIndex_(group);
	if(value>0)
	{
		RMP3.nudgeMode[index]=1;
	}
	else
	{
		RMP3.nudgeMode[index]=0;
	}
}

RMP3.nudgeLoopEnd = function (channel, control, value, status, group)
{
	var index=RMP3.getIndex_(group);
	if(value>0)
	{
		RMP3.nudgeMode[index]=2;
	}
	else
	{
		RMP3.nudgeMode[index]=0;
	}
}

RMP3.changeRateRange = function (channel, control, value, status, group)
{
	var index=RMP3.getIndex_(group);
	if(value>0)
	{
		RMP3.currentRateRange[index]++;
		if(RMP3.currentRateRange[index]>3)
		{
			RMP3.currentRateRange[index]=0;
		}

		//print("change rate range "+RMP3.rateRange[RMP3.currentRateRange[index]]);
		engine.setValue(group,"rateRange",RMP3.rateRange[RMP3.currentRateRange[index]]);

		if(RMP3.currentRateRange[index]==0)
		{
			RMP3.led_(RMP3.iface.pitch_4,1,group);
			RMP3.led_(RMP3.iface.pitch_8,0,group);
			RMP3.led_(RMP3.iface.pitch_16,0,group);
			RMP3.led_(RMP3.iface.pitch_100,0,group);
		}
		else if(RMP3.currentRateRange[index]==1)
		{
			RMP3.led_(RMP3.iface.pitch_4,0,group);
			RMP3.led_(RMP3.iface.pitch_8,1,group);
			RMP3.led_(RMP3.iface.pitch_16,0,group);
			RMP3.led_(RMP3.iface.pitch_100,0,group);
		}
		else if(RMP3.currentRateRange[index]==2)
		{
			RMP3.led_(RMP3.iface.pitch_4,0,group);
			RMP3.led_(RMP3.iface.pitch_8,0,group);
			RMP3.led_(RMP3.iface.pitch_16,1,group);
			RMP3.led_(RMP3.iface.pitch_100,0,group);
		}
		else if(RMP3.currentRateRange[index]==3)
		{
			RMP3.led_(RMP3.iface.pitch_4,0,group);
			RMP3.led_(RMP3.iface.pitch_8,0,group);
			RMP3.led_(RMP3.iface.pitch_16,0,group);
			RMP3.led_(RMP3.iface.pitch_100,1,group);
		}
	}
} //end RMP3.changeRateRange

RMP3.pitchZero = function (channel, control, value, status, group)
{
	if(value>0)
	{
		engine.setValue(group,"rate",0);
		RMP3.led_(RMP3.iface.pitch_0,1,group);
	}
	else
	{
		RMP3.led_(RMP3.iface.pitch_0,0,group);
	}
}

RMP3.beat_tap = function (channel, control, value, status, group)
{
	if(value>0)
	{
		engine.setValue(group,"bpm_tap",1);
	}
}

RMP3.back_fwd = function (channel, control, value, status, group)
{
	if(value==64)
	{
		engine.setValue(group,"fwd",0);
		engine.setValue(group,"back",0);
	}
	else if(value>64)
	{
		engine.setValue(group,"fwd",1);
	}
	else if(value<64)
	{
		engine.setValue(group,"back",1);
	}
}

RMP3.playTrack = function (channel, control, value, status, group) 
{
	//no action of no song loaded to deck
	if (engine.getValue(group, "duration") == 0) 
	{ 
		return; 
	}

	var isCupActive = engine.getValue(group,"cue_default");
	if(isCupActive == true)
	{
		//allow to change from cue to play mode (press play while cue hold, then let go cue)
		engine.setValue(group,"play",1);
		return;
	}

	var currentlyPlaying = engine.getValue(group,"play");
	if(value == RMP3.keyPressed)
	{
		if (currentlyPlaying == 1) 
		{
			engine.setValue(group,"play",0);
		}
		else 
		{
			engine.setValue(group,"play",1);
		}
	}
} //end RMP3.playTrack

RMP3.Cue = function (channel, control, value, status, group)
{
	//no action of no song loaded to deck
	if (engine.getValue(group, "duration") == 0) 
	{ 
		return; 
	}

	if(value == RMP3.keyPressed)
	{
		engine.setValue(group,"cue_default",1);
		RMP3.led_(RMP3.iface.play_pause,0,group);
		RMP3.led_(control,1,group);
	}
	if(value == RMP3.keyUp)
	{
		engine.setValue(group,"cue_default",0);
		RMP3.led_(control,0,group);		
	}	
}

RMP3.Scratch = function (channel, control, value, status, group)
{
	//see hold
	if(value == RMP3.keyPressed)
	{
		var index=RMP3.getIndex_(group);
		if(RMP3.scratchMode[index] == 1)
		{
			RMP3.scratchMode[index] = 0;
			RMP3.led_(control,0,group);
		}
		else
		{
			RMP3.scratchMode[index] = 1;
			RMP3.led_(control,1,group);
		}
	}
}

//sensitivity 1
RMP3.sensitivity1 = function (channel, control, value, status, group)
{
	var index=RMP3.getIndex_(group);
	if(value == RMP3.keyPressed)
	{
			RMP3.sensitivity[index] = 1;
			RMP3.led_(RMP3.iface.flanger,1,group);
			RMP3.led_(RMP3.iface.trans,0,group);
			RMP3.led_(RMP3.iface.pan,0,group);
	}
}

//sensitivity 2
RMP3.sensitivity2 = function (channel, control, value, status, group)
{
	var index=RMP3.getIndex_(group);
	if(value == RMP3.keyPressed)
	{
			RMP3.sensitivity[index] = 2;
			RMP3.led_(RMP3.iface.flanger,0,group);
			RMP3.led_(RMP3.iface.trans,1,group);
			RMP3.led_(RMP3.iface.pan,0,group);
	}
}

//sensitivity 3
RMP3.sensitivity3 = function (channel, control, value, status, group)
{
	var index=RMP3.getIndex_(group);
	if(value == RMP3.keyPressed)
	{
			RMP3.sensitivity[index] = 3;
			RMP3.led_(RMP3.iface.flanger,0,group);
			RMP3.led_(RMP3.iface.trans,0,group);
			RMP3.led_(RMP3.iface.pan,1,group);
	}
}

RMP3.JogWheel = function (channel, control, value, status, group)
{
	//values +/- around 64
	var jogValue = (value - 64); 
	//print('jogwheel val: '+jogValue);

	var index=RMP3.getIndex_(group);

	//scratch
	if (RMP3.scratchMode[index] == 1) 
	{
		engine.scratchTick(index+1,jogValue);
	}
	//small speed changes
	else
	{
		//-3 +3
		if(jogValue>20)
		{
			engine.setValue(group,"jog",+3);
		}
		else if(jogValue>10)
		{
			engine.setValue(group,"jog",+2);
		}
		else if(jogValue>0)
		{
			engine.setValue(group,"jog",+1);
		}
		else if(jogValue<20)
		{
			engine.setValue(group,"jog",-3);
		}
		else if(jogValue<10)
		{
			engine.setValue(group,"jog",-2);
		}
		else if(jogValue<0)
		{
			engine.setValue(group,"jog",-1);
		}
	}
} //end RMP3.JogWheel

//should distinguish playing/non-playing
RMP3.JogWheel_Hold = function (channel, control, value, status, group)
{
	//see scratch
	var index=RMP3.getIndex_(group);

	if(RMP3.scratchMode[index] == 0)
	{
		return;
	}

	if(value>0)
	{
		var sens=1024;
		if(RMP3.sensitivity[index]==1)
		{
			sens=128;
		}
		else if(RMP3.sensitivity[index]==2)
		{
			sens=512;
		}
		else if(RMP3.sensitivity[index]==3)
		{
			sens=1024;
		}

		engine.scratchEnable(index+1, sens, 33+1/3, 1.0/8, (1.0/8)/32);
	}
	else
	{
		engine.scratchDisable(index+1);
	}
}

RMP3.JogZoom = function (channel, control, value, status, group) 
{
	//1-6
	engine.setValue(group,"waveform_zoom", ((value/127)*5+1));
}

RMP3.PrevNextWheelShift = function (channel, control, value, status, group) 
{
	//ccw
	if(value==63)
	{
		engine.setValue("[Playlist]","SelectTrackKnob", -10);
	}
	//cw 65
	else
	{
		engine.setValue("[Playlist]","SelectTrackKnob", 10);
	}
}

RMP3.PrevNextWheel = function (channel, control, value, status, group) 
{
	var index=RMP3.getIndex_(group);

	//if in nudgeMode to set start or end, set stepsize
	var step=1024;
	if(RMP3.nudgeMode[index] != 0)
	{
                if(RMP3.sensitivity[index]==1)
                {
                        step=1024;
                }
                else if(RMP3.sensitivity[index]==2)
                {
                        step=512;
                }
                else if(RMP3.sensitivity[index]==3)
                {
                        step=128;
                }
	}

	if(RMP3.nudgeMode[index]==1)
	{
		//set loop boundaries start
		var loopStartPos=engine.getValue(group, "loop_start_position");
		print("LOOP START "+loopStartPos);

		//ccw
		if(value==63)
		{
			loopStartPos-=step;
		}
		//cw 65
		else
		{
			loopStartPos+=step;

		}
		engine.setValue(group, "loop_start_position",loopStartPos);

		//set cue point to start of loop
		engine.setValue(group,"cue_point",loopStartPos);

	}
	else if(RMP3.nudgeMode[index]==2)
	{
		//set loop boundaries end
		var loopEndPos=engine.getValue(group, "loop_end_position");
		print("LOOP END "+loopEndPos);

		//ccw
		if(value==63)
		{
			loopEndPos-=step;
		}
		//cw 65
		else
		{
			loopEndPos+=step;

		}
		engine.setValue(group, "loop_end_position",loopEndPos);
	}
	else
	{
		//if not setting start or end, do track list browsing
		//ccw
		if(value==63)
		{
			engine.setValue("[Playlist]","SelectPrevTrack", 1);
		}
		//cw 65
		else
		{
			engine.setValue("[Playlist]","SelectNextTrack", 1);

		}
	}
} //end RMP3.PrevNextWheel


RMP3.LoadSelectedTrack = function (channel, control, value, status, group) 
{
	//if pressed, will stop (if playing), load track and play at once
	if(value == RMP3.keyPressed)
	{
		engine.setValue(group,"play",0);
		engine.setValue(group, "LoadSelectedTrackAndPlay", 1);
	}
}

RMP3.LoopIn = function (channel, control, value, status, group) 
{
	if(value == RMP3.keyPressed)
	{
		engine.setValue(group,"loop_in",1);

		//set cue point to start of loop
		engine.setValue(group,"cue_set",1);

		RMP3.led_(control,1,group);
	}
}

RMP3.LoopOut = function (channel, control, value, status, group) 
{
	if(value == RMP3.keyPressed)
	{
		engine.setValue(group,"loop_out",1);
	}
}

RMP3.ReloopExit = function (channel, control, value, status, group)
{
	if(value>0)
	{
		if(engine.getValue(group,"loop_enabled"))
		{
			engine.setValue(group,"reloop_exit",1);
		}
		else
		{
			//doesn't work
			engine.setValue(group,"reloop_exit",0);
		}
	}
}

/*==========================================================================*/
//On event methods (from engine)
/*==========================================================================*/

RMP3.OnLoopEnabled = function (value,group)
{
	RMP3.led_(RMP3.iface.loop_in,value,group);
	RMP3.led_(RMP3.iface.loop_out,value,group);
}

RMP3.beatLed=0;

/*
RMP3.OnBeatActive = function (value,group)
{
	if(value==1)
	{
		print("BEAT "+group);
	}
}
*/		

RMP3.OnFilterHigh_KillButton = function (value,group)
{
	RMP3.led_(RMP3.iface.b1_1,value,group);
}

RMP3.OnFilterMid_KillButton = function (value,group)
{
	RMP3.led_(RMP3.iface.b2_1,value,group);
}

RMP3.OnFilterLow_KillButton = function (value,group)
{
	RMP3.led_(RMP3.iface.b4_1,value,group);
}

RMP3.OnKeyLockChange = function(value,group)
{
	RMP3.led_(RMP3.iface.keylock,value,group);
}

RMP3.OnRepeat = function (value,group)
{
	RMP3.led_(RMP3.iface.skid,value,group);
}

RMP3.OnAdjustBeatgrid = function (value,group)
{
	RMP3.led_(RMP3.iface.filter,value,group);
}

RMP3.OnQuantize = function (value,group)
{
	RMP3.led_(RMP3.iface.phase,value,group);
}

RMP3.OnHotcue1_1 = function (value,group)
{
	RMP3.led_(RMP3.iface._1,value,group);
}

RMP3.OnHotcue1_2 = function (value,group)
{
	RMP3.led_(RMP3.iface._2,value,group);
}

RMP3.OnHotcue1_3 = function (value,group)
{
	RMP3.led_(RMP3.iface._3,value,group);
}

RMP3.OnHotcue1_4 = function (value,group)
{
	RMP3.led_(RMP3.iface._4,value,group);
}

RMP3.isChannel_Playing = function (value,group,event)
{
		if(value == 0)
		{
			RMP3.led_(RMP3.iface.play_pause,0,group);
			RMP3.led_(RMP3.iface.cue,0,group);
		}
		else
		{	//if deck is playing but not in CUE modus
			if( engine.getValue(group,"cue_default") == 0)
			{
				RMP3.led_(RMP3.iface.play_pause,1,group);
			}
		}	
}

RMP3.isChannel_Cue_Active = function (value,group,evemt)
{
	if(value == 0)
	{
		RMP3.led_(RMP3.iface.cue,0,group);
	}
	else
	{
		RMP3.led_(RMP3.iface.cue,1,group);
	}
}

/*==========================================================================*/
//HELPERS
/*==========================================================================*/

RMP3.getIndex_ = function (group)
{
	if(group=="[Channel1]")
	{
		return 0;
	}
	else
	{
		return 1;
	}
}

RMP3.led_ = function(control,isOn,group)
{
	if(isOn==1)	
	{
		RMP3.lOn_(control,group);
	}
	else
	{
		RMP3.lOff_(control,group);
	}
}

RMP3.lOn_ = function(control,group)
{
	if(group == "[Channel1]")
	{
		midi.sendShortMsg(0x90, control, RMP3.ledOn); 
	}
	else if(group == "[Channel2]")
	{
		midi.sendShortMsg(0x91, control, RMP3.ledOn); 
	}
}

RMP3.lOff_ = function(control,group)
{
	if(group == "[Channel1]")
	{
		midi.sendShortMsg(0x90, control, RMP3.ledOff); 
	}
	else if(group == "[Channel2]")
	{
		midi.sendShortMsg(0x91, control, RMP3.ledOff); 
	}
}

/*==========================================================================*/
//rmp3 interface
/*==========================================================================*/

/*controls and leds on rmp-3 device*/
RMP3.iface=
{

/*special*/

	jog_top:		'0x20' /*on jog surface touch*/

/*snap back, relative*/
	,jog:			'0x35' /*cc: ccw: <=0x3f (63)    cw: >=0x41 (65)*/
	,jog_x:			'0x37' /*cc: ccw: <=0x3f (63)    cw: >=0x41 (65)*/
	,jog_y:			'0x39' /*cc: ccw: <=0x3f (63)    cw: >=0x41 (65)*/

	,track_wheel:		'0x32' /*cc: 0x3f: ccw  0x41: cw*/
	,track:			'0x2b' /*press*/

/*pitchbend event
	,pitch_slider:		'0xe0' 
*/
	,pitch_slider_center:	'0x26'
	,search:		'0x15' /*cc: center: 0x40 (64)*/

/*special, shift*/

	,jog_top_shift:		'0x5f' /*on jog surface touch*/

/*absolute value, device can remember*/
	,jog_shift:		'0x74' /*cc: 0x00 (0) - 0x7f (127)*/
	,jog_x_shift:		'0x76' /*cc: 0x00 (0) - 0x7f (127)*/
	,jog_y_shift:		'0x78' /*cc: 0x00 (0) - 0x7f (127)*/

	,track_whell_shift:	'0x71' /*cc: 0x3f: ccw  0x41: cw*/
	,track_shift:		'0x6a'

	,pitch_slider_shift:	'0x31' /*cc: 0x00 (PLUS side) - 0x7f (MINUS side)*/ 

	,pitch_slider_center_shift:	'0x65'
	,search_shift:		'0x54' /*cc: center: 0x40 (64)*/

/*switches*/

	,bank_p:		'0x25'
	,sgl_ctn:		'0x1f'
	,time:			'0x19'
	,next:			'0x0d'
	,prev:			'0x13'
	,shift:			'0x42'
	,eject:			'0x1b'
	,reloop:		'0x22'
	,bpm:			'0x09'
	,tap:			'0x03'
	,minus:			'0x08'
	,plus:			'0x02'
	,percent:		'0x1a'

/*switches / leds*/

	,cue:			'0x07'
	,play_pause:		'0x01' /**/
	,b1_8:			'0x05'
	,b1_4:			'0x06'
	,b1_2:			'0x2a'
	,b3_4:			'0x24'
	,b1_1:			'0x1e'
	,b2_1:			'0x0c'
	,b4_1:			'0x12'
	,scratch:		'0x2f'
	,skid:			'0x29'
	,filter:		'0x11'
	,phase:			'0x0b'
	,hold:			'0x1d'
	,echo:			'0x23'
	,flanger:		'0x21'
	,trans:			'0x27'
	,pan:			'0x2d'
	,loop_in:		'0x16'
	,loop_out:		'0x2e'
	,_1:			'0x1c'
	,_2:			'0x0a'
	,_3:			'0x10'
	,_4:			'0x0f'
	,save_to:		'0x04'
	,sampler:		'0x28'
	,undef:			'0x14' /*fader crosses zero?*/
	,pitch:			'0x0e' 
	,keylock:		'0x14'


/*plus SHIFT, switches */

	,bank_p_shift:			'0x64'
	,sgl_ctn_shift:			'0x5e'
	,time_shift:			'0x58'
	,next_shift:			'0x4c'
	,prev_shift:			'0x52'
/*	,shift_shift:			'0x'  no shift-shift :)*/ 
	,eject_shift:			'0x5a'
	,reloop_shift:			'0x61'
	,bpm_shift:			'0x68'
	,tap_shift:			'0x42'
	,minus_shift:			'0x47'
	,plus_shift:			'0x41'
	,percent_shift:			'0x59'

/*plus SHIFT, switches(/leds) (same led as non-shift) */

	,cue_shift:			'0x46'
	,play_pause_shift:		'0x40' /**/
	,b1_8_shift:			'0x44'
	,b1_4_shift:			'0x45'
	,b1_2_shift:			'0x69'
	,b3_4_shift:			'0x63'
	,b1_1_shift:			'0x5d'
	,b2_1_shift:			'0x4b'
	,b4_1_shift:			'0x51'
	,scratch_shift:			'0x6e'
	,skid_shift:			'0x68'
	,filter_shift:			'0x50'
	,phase_shift:			'0x4a'
	,hold_shift:			'0x5c'
	,echo_shift:			'0x62'
	,flanger_shift:			'0x60'
	,trans_shift:			'0x66'
	,pan_shift:			'0x6c'
	,loop_in_shift:			'0x55'
	,loop_out_shift:		'0x6d'
	,_1_shift:			'0x5b'
	,_2_shift:			'0x49'
	,_3_shift:			'0x4f'
	,_4_shift:			'0x4e'
	,save_to_shift:			'0x43'
	,sampler_shift:			'0x67'
	,undef_shift:			'0x53' /*fader crosses zero?*/
	,pitch_shift:			'0x4d' 

/*led only / second led*/
	,scratch_2:		'0x31'
	,_1_2:			'0x32'
	,_2_2:			'0x33'
	,_3_2:			'0x34'
	,_4_2:			'0x35'

/*led only*/
	,pitch_100:		'0x36'
	,pitch_16:		'0x37'
	,pitch_8:		'0x38'
	,pitch_4:		'0x39'
	,pitch_0:		'0x3a'
/*	,reverse		'0x30      used to select midi channel/deck*/

}; //end RMP3.iface
