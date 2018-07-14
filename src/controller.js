/****************************************************************/
/*      Reloop RMP-3 Cross Media Player controller script v2.2  */
/*      Feel free to tweak!                                     */
/*      Works best with Mixxx version 2.1.x                     */
/*      Overview on Bindings: https://github.com/7890/          */
/****************************************************************/

/*//tb/130407/130520/130608/130617/130618/160704*/

/*
At least one function only available in Mixxx v 2.1.0 is used in this script.

See also doc/mixxx_controller_documentation__reloop_rmp3_alpha.asciidoc.

Important notice to save debugging time when adding new functions:

This syntax will result in an error message (script function not found) (mixxx 1.10.1)
	c.PlayTrack=function(channel, control, value, status, group)

Correct syntax:
	c.PlayTrack = function(channel, control, value, status, group)

-> All such function definitions need SPACES around '=' !!

Don't forget to end functions with a ';' after the '}'
*/

function c() {};

/*needed in xml*/
c.controllerName='Reloop RMP-3';
c.author='Thomas Brand';
c.description='Custom Bindings for Reloop RMP-3 Cross Media Player';
c.controllerId='RMP-3';
c.channelCount=2;
c.functionPrefix='c';
/*name of javascript file (this)*/
c.jsFile='Reloop-RMP-3-scripts.js';
/*increment only on functional changes*/
c.scriptVersion='2.4';

/*common midi values*/
c.ledOn=0x7F;
c.ledOff=0x00;
c.keyPressed=0x7F;
c.keyUp=0x00;

/*array holding all control 'objects'*/
c.controls=new Array();

c.scriptBinding='<script-binding/>';
c.normal='<normal/>';
c.channel='[Channel]';
c.playlist='[Playlist]';

/*pitch range of fader 4 - 100%*/
c.rateRange=new Array(4);
c.rateRange[0]=0.04;
c.rateRange[1]=0.08;
c.rateRange[2]=0.16;
c.rateRange[3]=1.00;

c.currentRateRange=new Array(c.channelCount);
c.currentRateRange[0]=1;
c.currentRateRange[1]=1;

c.pitchAtZero=new Array(c.channelCount);
c.pitchAtZero[0]=0;
c.pitchAtZero[1]=0;

c.pitchLocked=new Array(c.channelCount);
c.pitchLocked[0]=0;
c.pitchLocked[1]=0;

c.lastPitch=new Array(c.channelCount);
c.lastPitch[0]=0;
c.lastPitch[1]=0;

c.playDown=new Array(c.channelCount);
c.playDown[0]=0;
c.playDown[1]=0;

c.cueDown=new Array(c.channelCount);
c.cueDown[0]=0;
c.cueDown[1]=0;

/*to disable blinking led on every beat, set this to 0*/
/*hit filter_shift '0x50' to toggle on/off*/
c.blinkBeats=new Array(c.channelCount);
c.blinkBeats[0]=1;
c.blinkBeats[1]=1;

c.scratchMode=new Array(c.channelCount);
c.scratchMode[0]=0;
c.scratchMode[1]=0;

/*1 (fast) - 3 (slow)*/
/*used for jog scratch and loop nudge*/
c.sensitivity=new Array(c.channelCount);
c.sensitivity[0]=1;
c.sensitivity[1]=1;

/*0: none, 1: start, 2: end, 3: both*/
c.nudgeMode=new Array(c.channelCount);
c.nudgeMode[0]=0;
c.nudgeMode[1]=0;

c.nudgeStartPressed=new Array(c.channelCount);
c.nudgeStartPressed[0]=0;
c.nudgeStartPressed[1]=0;

c.nudgeEndPressed=new Array(c.channelCount);
c.nudgeEndPressed[0]=0;
c.nudgeEndPressed[1]=0;

/*==========================================================================*/
/*map: create control object and put to controls array*/
/*==========================================================================*/

/*template to create map objects*/
c.Map = function(status, midino, group, key, description, option, connect)
{
	for(var i=0;i<c.channelCount;i++)
	{
		var control_name='_'+midino+'_'+i;

		var str="";
		str+=control_name+'= new Object();';
		str+=control_name+'.status=status+'+i+';';
		str+=control_name+'.midino=midino;';
		str+=control_name+'.connect=connect;';

		var group_=group;

		/*set group name*/
		if(group=="[Channel]")
		{
			group_='[Channel'+(i+1)+']';
		}

		str+=control_name+'.group=group_;';
		str+=control_name+'.key=key;';
		str+=control_name+'.description=description;';
		str+=control_name+'.options=option;';

		/*object can express itself as xml*/
		str+=control_name+'.xml = function()';
		str+='{';
		str+='return \'';
		str+='<!--'+control_name+'-->';
		str+='<control><midino>'+midino+'</midino>';
		str+='<status>'+status+''+i+'</status>';
		str+='<description>'+description+'</description>';
		str+='<group>'+group_+'</group>';
		str+='<key>'+key+'</key>';
		str+='<options>'+option+'</options></control>\'';
		str+='};';

		if(connect==1)
		{
			var str_='c.On'+key+' = function(value, group)';
			str_+='{';
			str_+='c.LED('+midino+', value, group);';
			str_+='};';

			/*group,key,callback*/
			str_+='engine.connectControl( "'+group_+'", "'+key+'", "c.On'+key+'");';

			/*print(str_);*/
			eval(str_);
		}

		str+='c.controls.push('+control_name+');';

		/*print(str);*/
		eval(str);

	} /*end for channel count*/
};

/*print mixxx xml from meta data and mappings*/
c.X = function(tag, content){return '<'+tag+'>'+content+'</'+tag+'>';};

c.PrintXml = function()
{
	var d=new Date();
	var out='<MixxxMIDIPreset mixxxVersion="1.11.0+" schemaVersion="1">';
	out+='<!-- created '+d+' -->';
	out+='<!-- script version '+c.scriptVersion+' -->';

	out+=c.X('info',
		c.X('name', c.controllerName)
		+c.X('author', c.author)
		+c.X('description', c.description)
	);

	out+='<controller id="'+c.controllerId+'">';
	out+=c.X('scriptfiles','<file functionprefix="'+c.functionPrefix+'" filename="'+c.jsFile+'"/>');
	out+='<controls>';

	/*engine.error(c.controls.length);*/

	for(var i=0;i<c.controls.length; i++)
	{
		/*print(controls[i].json());*/
		out+=c.controls[i].xml();
	}
	out+='</controls></controller></MixxxMIDIPreset>';
	print(out);
};

/*==========================================================================*/
/*rmp3 interface*/
/*==========================================================================*/

/*controls and leds on rmp-3 device*/
c.i=
{
/*special*/
	jog_top:		'0x20' /*on jog surface touch*/

/*snap back, relative*/
	,jog:			'0x35' /*cc: ccw: <=0x3f (63)    cw: >=0x41 (65)*/
	,jog_x:			'0x37' /*cc: ccw: <=0x3f (63)    cw: >=0x41 (65)*/
	,jog_y:			'0x39' /*cc: ccw: <=0x3f (63)    cw: >=0x41 (65)*/

	,track_wheel:		'0x32' /*cc: 0x3f: ccw  0x41: cw*/
	,track_wheel_shift:	'0x71'
	,track:			'0x2b' /*press*/

/*pitchbend event*/
	,pitch_slider:		'0x5e' /*'0xe0'*/

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
	,pitch:			'0x0e'
	,keylock:		'0x14'

/*plus SHIFT, switches */
	,bank_p_shift:		'0x64'
	,sgl_ctn_shift:		'0x5e'
	,time_shift:		'0x58'
	,next_shift:		'0x4c'
	,prev_shift:		'0x52'
/*	,shift_shift:		'0x'  no shift-shift :)*/
	,eject_shift:		'0x5a'
	,reloop_shift:		'0x61'
	,bpm_shift:		'0x68'
	,tap_shift:		'0x42'
	,minus_shift:		'0x47'
	,plus_shift:		'0x41'
	,percent_shift:		'0x59'

/*plus SHIFT, switches(/leds) (same led as non-shift) */
	,cue_shift:		'0x46'
	,play_pause_shift:	'0x40' /**/
	,b1_8_shift:		'0x44'
	,b1_4_shift:		'0x45'
	,b1_2_shift:		'0x69'
	,b3_4_shift:		'0x63'
	,b1_1_shift:		'0x5d'
	,b2_1_shift:		'0x4b'
	,b4_1_shift:		'0x51'
	,scratch_shift:		'0x6e'
	,skid_shift:		'0x68'
	,filter_shift:		'0x50'
	,phase_shift:		'0x4a'
	,hold_shift:		'0x5c'
	,echo_shift:		'0x62'
	,flanger_shift:		'0x60'
	,trans_shift:		'0x66'
	,pan_shift:		'0x6c'
	,loop_in_shift:		'0x55'
	,loop_out_shift:	'0x6d'
	,_1_shift:		'0x5b'
	,_2_shift:		'0x49'
	,_3_shift:		'0x4f'
	,_4_shift:		'0x4e'
	,save_to_shift:		'0x43'
	,sampler_shift:		'0x67'
	,undef_shift:		'0x53' /*fader crosses zero?*/
	,pitch_shift:		'0x4d'

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
/*	,reverse		'0x30  used to select midi channel/deck*/

}; /*end RMP3.iface*/

/*==========================================================================*/
/*mappings used to create xml and doing auto connect to events*/
/*==========================================================================*/

/*note that channel is not defined 0x9() and there is no group numbering [Channel()]*/

/*~ midino, status, group, key, description, options, connect*/
c.Map("0x9",c.i.play_pause	,c.channel, "c.PlayTrack", "", c.scriptBinding, 0);
c.Map("0x9",c.i.cue		,c.channel, "c.Cue", "", c.scriptBinding, 0);
c.Map("0x9",c.i.cue_shift	,c.channel, "cue_set", "", c.normal, 0);
c.Map("0x9",c.i.b1_4		,c.channel, "reverse", "", c.normal, 0);
c.Map("0x9",c.i.b1_4_shift	,c.channel, "reverseroll", "", c.normal, 0);
c.Map("0x9",c.i.b1_2		,c.channel, "c.TemporaryPause", "", c.scriptBinding, 0);
c.Map("0x9",c.i.b3_4		,c.channel, "c.TemporaryVolumeKill", "", c.scriptBinding, 0);
c.Map("0x9",c.i.b1_1		,c.channel, "filterHighKill", "", c.normal, 0);
c.Map("0x9",c.i.b2_1		,c.channel, "filterMidKill", "", c.normal, 0);
c.Map("0x9",c.i.b4_1		,c.channel, "filterLowKill", "", c.normal, 0);
c.Map("0x9",c.i.skid		,c.channel, "repeat", "", c.normal, 1);
c.Map("0x9",c.i.filter		,c.channel, "beats_translate_curpos", "", c.normal, 1);
c.Map("0x9",c.i.phase		,c.channel, "quantize", "", c.normal, 1);
c.Map("0x9",c.i.hold		,c.channel, "c.ToggleReverse", "", c.scriptBinding, 0);
c.Map("0x9",c.i.keylock		,c.channel, "keylock", "", c.normal, 1);
c.Map("0x9",c.i.bank_p		,c.playlist, "SelectPrevPlaylist", "", c.normal, 0);
c.Map("0x9",c.i.sgl_ctn		,c.playlist, "SelectNextPlaylist", "", c.normal, 0);
c.Map("0x9",c.i.time		,c.channel, "start", "", c.normal, 0);
c.Map("0x9",c.i._1		,c.channel, "hotcue_1_activate", "", c.normal, 0);
c.Map("0x9",c.i._2		,c.channel, "hotcue_2_activate", "", c.normal, 0);
c.Map("0x9",c.i._3		,c.channel, "hotcue_3_activate", "", c.normal, 0);
c.Map("0x9",c.i._4		,c.channel, "hotcue_4_activate", "", c.normal, 0);
c.Map("0x9",c.i._1_shift	,c.channel, "hotcue_1_clear", "", c.normal, 0);
c.Map("0x9",c.i._2_shift	,c.channel, "hotcue_2_clear", "", c.normal, 0);
c.Map("0x9",c.i._3_shift	,c.channel, "hotcue_3_clear", "", c.normal, 0);
c.Map("0x9",c.i._4_shift	,c.channel, "hotcue_4_clear", "", c.normal, 0);
c.Map("0x9",c.i.bpm		,c.channel, "beatsync_tempo", "", c.normal, 0);
c.Map("0x9",c.i.save_to		,c.channel, "c.LoopHalve", "", c.scriptBinding, 0);
c.Map("0x9",c.i.sampler		,c.channel, "c.LoopDouble", "", c.scriptBinding, 0);
c.Map("0x9",c.i.save_to_shift	,c.channel, "c.LoopDoubleInverse", "", c.scriptBinding, 0);
c.Map("0x9",c.i.sampler_shift	,c.channel, "c.LoopHalveInverse", "", c.scriptBinding, 0);
c.Map("0x9",c.i.minus		,c.channel, "rate_temp_down_small", "", c.normal, 0);
c.Map("0x9",c.i.plus		,c.channel, "rate_temp_up_small", "", c.normal, 0);
c.Map("0x9",c.i.track		,c.channel, "c.LoadSelectedTrack", "", c.scriptBinding, 0);
c.Map("0x9",c.i.jog_top		,c.channel, "c.JogWheelHold", "", c.scriptBinding, 0);
c.Map("0x9",c.i.scratch		,c.channel, "c.Scratch", "", c.scriptBinding, 0);
c.Map("0x9",c.i.filter_shift	,c.channel, "c.ToggleBlinkBeats", "", c.scriptBinding, 0);
c.Map("0x9",c.i.prev		,c.channel, "c.NudgeLoopStart", "", c.scriptBinding, 0);
c.Map("0x9",c.i.next		,c.channel, "c.NudgeLoopEnd", "", c.scriptBinding, 0);
c.Map("0x9",c.i.prev_shift	,c.channel, "c.StepLoopBack", "", c.scriptBinding, 0);
c.Map("0x9",c.i.next_shift	,c.channel, "c.StepLoopForward", "", c.scriptBinding, 0);
c.Map("0x9",c.i.loop_in		,c.channel, "c.LoopIn", "", c.scriptBinding, 0);
c.Map("0x9",c.i.loop_out	,c.channel, "c.LoopOut", "", c.scriptBinding, 0);
c.Map("0x9",c.i.reloop		,c.channel, "reloop_toggle", "", c.normal, 0);
c.Map("0x9",c.i.percent		,c.channel, "c.ChangeRateRange", "", c.scriptBinding, 0);
c.Map("0x9",c.i.pitch_slider_center,c.channel, "c.PitchZero", "", c.scriptBinding, 0);
c.Map("0x9",c.i.pitch		,c.channel, "c.TogglePitchLock", "", c.scriptBinding, 0);
c.Map("0x9",c.i.tap		,c.channel, "c.BeatTap", "", c.scriptBinding, 0);
c.Map("0x9",c.i.flanger		,c.channel, "c.Sensitivity1", "", c.scriptBinding, 0);
c.Map("0x9",c.i.trans		,c.channel, "c.Sensitivity2", "", c.scriptBinding, 0);
c.Map("0x9",c.i.pan		,c.channel, "c.Sensitivity3", "", c.scriptBinding, 0);
c.Map("0x9",c.i.eject		,c.channel, "eject", "", c.normal, 0);

c.Map("0xb",c.i.track_wheel	,c.channel, "c.PrevNextWheel", "", c.scriptBinding, 0);
c.Map("0xb",c.i.track_wheel_shift,c.playlist, "c.PrevNextWheelShift", "", c.scriptBinding, 0);
c.Map("0xb",c.i.jog		,c.channel, "c.JogWheel", "", c.scriptBinding, 0);
c.Map("0xb",c.i.jog_shift	,c.channel, "c.JogZoom", "", c.scriptBinding, 0);
c.Map("0xb",c.i.search		,c.channel, "c.BackFwd", "", c.scriptBinding, 0);

c.Map("0xe",c.i.pitch_slider	,c.channel, "c.Rate", "", c.scriptBinding, 0);

/*javascript host can call this method to get xml*/
/*c.printXml();*/

/*==========================================================================*/
/*c.init: common function (called by mixxx at startup/load control interface)*/
/*==========================================================================*/
c.init = function(id)
{
	print("Initalizing Reloop RMP-3...");

	c.ResetLEDs();
	c.ConnectEvents();
	c.SetInitialValues();

	print("RPM-3 READY.");

}; /*end c.init*/

/*==========================================================================*/
/*c.shutdown: common function (called by mixxx)
/*==========================================================================*/
c.shutdown = function(id)
{
	/*Turn all LEDs off by using init function*/
	c.ResetLEDs();
	print("Bye!");
};

c.SetInitialValues = function()
{
	for(var i=0;i<c.channelCount;i++)
	{
		var group='[Channel'+(i+1)+']';

		var index=c.GetIndex(group);

		/*read current states to initially set indications*/
		/*+/- 8%*/
		engine.setValue(group, "rateRange", c.rateRange[c.currentRateRange[index]]);
		engine.setValue(group, "rate_dir", -1);

		/*turn on defaults*/
		/*pitch 8%*/
		c.LED(c.i.pitch_8, 1, group);

		/*sensitivity 1*/
		c.LED(c.i.flanger, 1, group);

		if(engine.getValue(group, "play"))
		{
			c.LED(c.i.play_pause, 1, group);
		}
		if(engine.getValue(group, "filterHighKill"))
		{
			c.LED(c.i.b1_1, 1, group);
		}
		if(engine.getValue(group, "filterMidKill"))
		{
			c.LED(c.i.b2_1, 1, group);
		}
		if(engine.getValue(group, "filterLowKill"))
		{
			c.LED(c.i.b4_1, 1, group);
		}
		if(engine.getValue(group, "keylock"))
		{
			c.LED(c.i.keylock, 1, group);
		}
		if(engine.getValue(group, "repeat"))
		{
			c.LED(c.i.skid, 1, group);
		}
		if(engine.getValue(group, "quantize"))
		{
			c.LED(c.i.phase, 1, group);
		}
		if(engine.getValue(group, "hotcue_1_enabled"))
		{
			c.LED(c.i._1, 1, group);
		}
		if(engine.getValue(group, "hotcue_2_enabled"))
		{
			c.LED(c.i._2, 1, group);
		}
		if(engine.getValue(group, "hotcue_3_enabled"))
		{
			c.LED(c.i._3, 1, group);
		}
		if(engine.getValue(group, "hotcue_4_enabled"))
		{
			c.LED(c.i._4, 1, group);
		}
		if(engine.getValue(group, "loop_enabled"))
		{
			c.LED(c.i.loop_in, 1, group);
			c.LED(c.i.loop_out, 1, group);
		}
	}/*end for channelcount*/
}; /*end c.setInitialValues*/

c.ConnectEvents = function()
{
	for(var i=0;i<c.channelCount;i++)
	{
		var group='[Channel'+(i+1)+']';

		/*connect to events*/
		engine.connectControl(group, "play", "c.OnChannelPlaying");
/*		engine.connectControl(group, "cue_default", "c.OnChannelCueActive");*/

		engine.connectControl(group, "hotcue_1_enabled", "c.OnHotcue1_1");
		engine.connectControl(group, "hotcue_2_enabled", "c.OnHotcue1_2");
		engine.connectControl(group, "hotcue_3_enabled", "c.OnHotcue1_3");
		engine.connectControl(group, "hotcue_4_enabled", "c.OnHotcue1_4");

		engine.connectControl(group, "loop_enabled", "c.OnLoopEnabled");
		engine.connectControl(group, "beat_active", "c.OnBeatActive");

		/*more connections done via map()*/
	}
}; /*end c.ConnectEvents*/

c.ResetLEDs = function()
{
	for(var i=0;i<c.channelCount;i++)
	{
		var group='[Channel'+(i+1)+']';

		/*Turn all LEDS off*/
		c.LED(c.i.play_pause, 0, group);
		c.LED(c.i.cue, 0, group);
		c.LED(c.i.loop_in, 0, group);
		c.LED(c.i.loop_out, 0, group);
		c.LED(c.i.b1_1, 0, group);
		c.LED(c.i.b2_1, 0, group);
		c.LED(c.i.b4_1, 0, group);
		c.LED(c.i._1, 0, group);
		c.LED(c.i._2, 0, group);
		c.LED(c.i._3, 0, group);
		c.LED(c.i._4, 0, group);
		c.LED(c.i.scratch, 0, group);
		c.LED(c.i.skid, 0, group);
		c.LED(c.i.scratch, 0, group);
		c.LED(c.i.phase, 0, group);
		c.LED(c.i.pitch_4, 0, group);
		c.LED(c.i.pitch_8, 0, group);
		c.LED(c.i.pitch_16, 0, group);
		c.LED(c.i.pitch_100, 0, group);
		c.LED(c.i.keylock, 0, group);
		c.LED(c.i.pitch0, 0, group);
		c.LED(c.i.flanger, 0, group);
		c.LED(c.i.trans, 0, group);
		c.LED(c.i.pan, 0, group);
	}
}; /*end c.resetLEDs*/

c.LoopHalve = function(channel, control, value, status, group)
{
	if(value==c.keyPressed)
	{
		var loopStartPos=engine.getValue(group, "loop_start_position");
		var loopEndPos=engine.getValue(group, "loop_end_position");

		var diff=loopEndPos-loopStartPos;
		loopEndPos=loopStartPos+(diff/2);

		engine.setValue(group, "loop_end_position", loopEndPos);
	}
};

c.LoopDouble = function(channel, control, value, status, group)
{
	if(value==c.keyPressed)
	{
		var loopStartPos=engine.getValue(group, "loop_start_position");
		var loopEndPos=engine.getValue(group, "loop_end_position");

		var diff=loopEndPos-loopStartPos;
		loopEndPos=loopStartPos+2*diff;

		engine.setValue(group, "loop_end_position", loopEndPos);
	}
};

c.LoopHalveInverse = function(channel, control, value, status, group)
{
	if(value==c.keyPressed)
	{
		var loopStartPos=engine.getValue(group, "loop_start_position");
		var loopEndPos=engine.getValue(group, "loop_end_position");

		var diff=loopEndPos-loopStartPos;
		loopStartPos+=(diff/2);

		engine.setValue(group, "loop_start_position", loopStartPos);

		/*set cue point to start of loop*/
		engine.setValue(group, "cue_point", loopStartPos);
	}
};

c.LoopDoubleInverse = function(channel, control, value, status, group)
{
	if(value==c.keyPressed)
	{
		var loopStartPos=engine.getValue(group, "loop_start_position");
		var loopEndPos=engine.getValue(group, "loop_end_position");

		var diff=loopEndPos-loopStartPos;
		loopStartPos-=diff;

		engine.setValue(group, "loop_start_position", loopStartPos);

		/*set cue point to start of loop*/
		engine.setValue(group, "cue_point", loopStartPos);
	}
};

c.StepLoopBack = function(channel, control, value, status, group)
{
	if(value==c.keyPressed)
	{
		var loopStartPos=engine.getValue(group, "loop_start_position");
		var loopEndPos=engine.getValue(group, "loop_end_position");

		var diff=loopEndPos-loopStartPos;
		loopStartPos-=diff;
		loopEndPos-=diff;

		engine.setValue(group, "loop_start_position", loopStartPos);

		/*set cue point to start of loop*/
		engine.setValue(group, "cue_point", loopStartPos);

		engine.setValue(group, "loop_end_position", loopEndPos);
	}
};

c.StepLoopForward = function(channel, control, value, status, group)
{
	if(value==c.keyPressed)
	{
		var loopStartPos=engine.getValue(group, "loop_start_position");
		var loopEndPos=engine.getValue(group, "loop_end_position");

		var diff=loopEndPos-loopStartPos;
		loopStartPos+=diff;
		loopEndPos+=diff;

		engine.setValue(group, "loop_end_position", loopEndPos);

		engine.setValue(group, "loop_start_position", loopStartPos);

		/*set cue point to start of loop*/
		engine.setValue(group, "cue_point", loopStartPos);
	}
};

c.EvaluateNudgeMode = function(index)
{
	/*start*/
	if(c.nudgeStartPressed[index]==1 && c.nudgeEndPressed[index]==0)
	{
		c.nudgeMode[index]=1;
	}
	/*end*/
	else if(c.nudgeStartPressed[index]==0 && c.nudgeEndPressed[index]==1)
	{
		c.nudgeMode[index]=2;
	}
	/*if both pressed*/
	else if(c.nudgeStartPressed[index]==1 && c.nudgeEndPressed[index]==1)
	{
		c.nudgeMode[index]=3;
	}
	else
	{
		c.nudgeMode[index]=0;
	}
};

c.NudgeLoopStart = function(channel, control, value, status, group)
{
	var index=c.GetIndex(group);
	if(value==c.keyPressed)
	{
		c.nudgeStartPressed[index]=1;
	}
	else
	{
		c.nudgeStartPressed[index]=0;
	}
	c.EvaluateNudgeMode(index);
};

c.NudgeLoopEnd = function(channel, control, value, status, group)
{
	var index=c.GetIndex(group);
	if(value==c.keyPressed)
	{
		c.nudgeEndPressed[index]=1;
	}
	else
	{
		c.nudgeEndPressed[index]=0;
	}
	c.EvaluateNudgeMode(index);
};

c.ChangeRateRange = function(channel, control, value, status, group)
{
	var index=c.GetIndex(group);
	if(value==c.keyPressed)
	{
		c.currentRateRange[index]++;
		if(c.currentRateRange[index]>3)
		{
			c.currentRateRange[index]=0;
		}

		/*print("change rate range "+RMP3.rateRange[RMP3.currentRateRange[index]]);*/
		engine.setValue(group, "rateRange", c.rateRange[c.currentRateRange[index]]);

		/* don't change now if locked */
		if(c.pitchLocked[index]==0)
		{
			engine.setValue(group, "rate", c.lastPitch[index]);
		}

		if(c.currentRateRange[index]==0)
		{
			c.LED(c.i.pitch_4, 1, group);
			c.LED(c.i.pitch_8, 0, group);
			c.LED(c.i.pitch_16, 0, group);
			c.LED(c.i.pitch_100, 0, group);
		}
		else if(c.currentRateRange[index]==1)
		{
			c.LED(c.i.pitch_4, 0, group);
			c.LED(c.i.pitch_8, 1, group);
			c.LED(c.i.pitch_16, 0, group);
			c.LED(c.i.pitch_100, 0, group);
		}
		else if(c.currentRateRange[index]==2)
		{
			c.LED(c.i.pitch_4, 0, group);
			c.LED(c.i.pitch_8, 0, group);
			c.LED(c.i.pitch_16, 1, group);
			c.LED(c.i.pitch_100, 0, group);
		}
		else if(c.currentRateRange[index]==3)
		{
			c.LED(c.i.pitch_4, 0, group);
			c.LED(c.i.pitch_8, 0, group);
			c.LED(c.i.pitch_16, 0, group);
			c.LED(c.i.pitch_100, 1, group);
		}
	}
}; /*end c.changeRateRange*/

c.PitchZero = function(channel, control, value, status, group)
{
	var index=c.GetIndex(group);
	if(value==c.keyPressed)
	{
		engine.setValue(group, "rate", 0);
		c.pitchAtZero[index]=1;
	}
	else
	{
		c.pitchAtZero[index]=0;
	}
	c.EvalSetPitchLED(group);
};

/*
   _  127  1.00  -8, -...
  | |
  | |
  |=|      0
  | |
  |_| 0   -1.00  +8, ...
*/
c.Rate = function(channel, control, value, status, group)
{
	var index=c.GetIndex(group);
	/* remember value for pitch lock/unlock and rate changes. - to invert */
	c.lastPitch[index]=script.midiPitch(control, value, status);

	if(c.pitchLocked[index]==0)
	{
		engine.setValue(group, "rate", c.lastPitch[index]);
	}
	/*ignore if pitch locked*/
};

c.TogglePitchLock = function(channel, control, value, status, group)
{
	if(value==c.keyPressed)
	{
		var index=c.GetIndex(group);
		if(c.pitchLocked[index]==1)
		{
			c.pitchLocked[index]=0;
			engine.setValue(group, "rate", c.lastPitch[index]);
		}
		else
		{
			c.pitchLocked[index]=1;
			engine.setValue(group, "rate", 0);
		}
		c.EvalSetPitchLED(group);
	}
};

c.BeatTap = function(channel, control, value, status, group)
{
	if(value==c.keyPressed)
	{
		engine.setValue(group, "bpm_tap", 1);
	}
};

c.BackFwd = function(channel, control, value, status, group)
{
	if(value==64)
	{
		engine.setValue(group, "fwd", 0);
		engine.setValue(group, "back", 0);
	}
	else if(value>64)
	{
		engine.setValue(group, "fwd", 1);
	}
	else if(value<64)
	{
		engine.setValue(group, "back", 1);
	}
};

c.ToggleReverse = function(channel, control, value, status, group)
{
	var currentlyReversed=engine.getValue(group, "reverse");
	if(value==c.keyPressed)
	{
		if(currentlyReversed==1)
		{
			engine.setValue(group, "reverse", 0);
			c.LED(control, 0, group);
		}
		else
		{
			engine.setValue(group, "reverse", 1);
			c.LED(control, 1, group);
		}
	}
}

c.PlayTrack = function(channel, control, value, status, group)
{
	var index=c.GetIndex(group);
	/*no action if no song loaded to deck*/
	if(engine.getValue(group, "duration")==0)
	{
		return;
	}

	var currentlyPlaying=engine.getValue(group, "play");
	if(value==c.keyPressed)
	{
		c.playDown[index]=1;
		if(currentlyPlaying==1 && c.cueDown[index]==0)
		{
			engine.setValue(group, "play", 0);
		}
		else
		{
			engine.setValue(group, "play", 1);
		}
	}
	else
	{
		c.playDown[index]=0;
	}

}; /*end c.PlayTrack*/

c.Cue = function(channel, control, value, status, group)
{
	var index=c.GetIndex(group);
	if(engine.getValue(group, "duration")==0)
	{
		return;
	}

	var currentlyPlaying=engine.getValue(group, "play");

	if(value==c.keyPressed)
	{
		c.cueDown[index]=1;
		engine.setValue(group, "cue_gotoandplay", 1);
		c.LED(c.i.cue, 1, group);
	}
	else
	{
		c.cueDown[index]=0;
		if(currentlyPlaying==1 && c.playDown[index]==0)
		{
			engine.setValue(group, "cue_gotoandstop", 1);
		}
		c.LED(c.i.cue, 0, group);
	}
};

c.TemporaryPause = function(channel, control, value, status, group)
{
	var currentlyPlaying=engine.getValue(group, "play");

	if(value==c.keyPressed)
	{
		if(currentlyPlaying==1)
		{
			engine.setValue(group, "play", 0);
		}
	}
	else
	{
		engine.setValue(group, "play", 1);
	}
};

c.TemporaryVolumeKill = function(channel, control, value, status, group)
{
	if(value==c.keyPressed)
	{
		engine.setValue(group, "volume", 0);
	}
	else
	{
		engine.setValue(group, "volume", 1);
	}
};

c.Scratch = function(channel, control, value, status, group)
{
	/*see hold*/
	if(value==c.keyPressed)
	{
		var index=c.GetIndex(group);
		if(c.scratchMode[index]==1)
		{
			c.scratchMode[index]=0;
			c.LED(control, 0, group);
		}
		else
		{
			c.scratchMode[index]=1;
			c.LED(control, 1, group);
		}
	}
};

c.Sensitivity1 = function(channel, control, value, status, group)
{
	var index=c.GetIndex(group);
	if(value==c.keyPressed)
	{
		c.sensitivity[index]=1;
		c.LED(c.i.flanger, 1, group);
		c.LED(c.i.trans, 0, group);
		c.LED(c.i.pan, 0, group);
	}
};

c.Sensitivity2 = function(channel, control, value, status, group)
{
	var index=c.GetIndex(group);
	if(value==c.keyPressed)
	{
		c.sensitivity[index]=2;
		c.LED(c.i.flanger, 0, group);
		c.LED(c.i.trans, 1, group);
		c.LED(c.i.pan, 0, group);
	}
};

c.Sensitivity3 = function(channel, control, value, status, group)
{
	var index=c.GetIndex(group);
	if(value==c.keyPressed)
	{
		c.sensitivity[index]=3;
		c.LED(c.i.flanger, 0, group);
		c.LED(c.i.trans, 0, group);
		c.LED(c.i.pan, 1, group);
	}
};

c.JogWheel = function(channel, control, value, status, group)
{
	/*values +/- around 64*/
	var jogValue=(value - 64);
	/*print('jogwheel val: '+jogValue);*/

	var index=c.GetIndex(group);

	/*scratch*/
	if(c.scratchMode[index]==1)
	{
		engine.scratchTick(index+1, jogValue);
	}
	/*small speed changes*/
	else
	{
		/*-3 +3*/
		if(jogValue>20)
		{
			engine.setValue(group, "jog", +3);
		}
		else if(jogValue>10)
		{
			engine.setValue(group, "jog", +2);
		}
		else if(jogValue>0)
		{
			engine.setValue(group, "jog", +1);
		}
		else if(jogValue<20)
		{
			engine.setValue(group, "jog", -3);
		}
		else if(jogValue<10)
		{
			engine.setValue(group, "jog", -2);
		}
		else if(jogValue<0)
		{
			engine.setValue(group, "jog", -1);
		}
	}
}; /*end c.JogWheel*/

/*should distinguish playing/non-playing*/
c.JogWheelHold = function(channel, control, value, status, group)
{
	/*see scratch*/
	var index=c.GetIndex(group);

	if(c.scratchMode[index]==0)
	{
		return;
	}

	if(value==c.keyPressed)
	{
		var sens=1024;
		if(c.sensitivity[index]==1)
		{
			sens=128;
		}
		else if(c.sensitivity[index]==2)
		{
			sens=512;
		}
		else if(c.sensitivity[index]==3)
		{
			sens=1024;
		}

		engine.scratchEnable(index+1, sens, 33+1/3, 1.0/8, (1.0/8)/32);
	}
	else
	{
		engine.scratchDisable(index+1);
	}
};

c.JogZoom = function(channel, control, value, status, group)
{
	/*1-6*/
	engine.setValue(group, "waveform_zoom", 6-((value/127)*5));
};

c.PrevNextWheelShift = function(channel, control, value, status, group)
{
	/*ccw*/
	if(value==63)
	{
		engine.setValue(c.playlist, "SelectTrackKnob", -10);
	}
	/*cw 65*/
	else
	{
		engine.setValue(c.playlist, "SelectTrackKnob", 10);
	}
};

c.PrevNextWheel = function(channel, control, value, status, group)
{
	var index=c.GetIndex(group);
/* //// NEEDS  DOCUMENTATION */

	/*if in nudgeMode to set start or end, set stepsize*/
	var step=1024;
	if(c.nudgeMode[index] != 0)
	{
		if(c.sensitivity[index]==1)
		{
			step=1024;
		}
		else if(c.sensitivity[index]==2)
		{
			step=512;
		}
		else if(c.sensitivity[index]==3)
		{
			step=128;
		}
	}

	var isQuantized=engine.getValue(group, "quantize");

	if(c.nudgeMode[index]==1)
	{
		/*set loop boundaries start*/
		var loopStartPos=engine.getValue(group, "loop_start_position");
		print("LOOP START "+loopStartPos);

		/*ccw*/
		if(value==63)
		{
			loopStartPos-=step;
		}
		/*cw 65*/
		else
		{
			loopStartPos+=step;

		}
		engine.setValue(group, "loop_start_position", loopStartPos);

		/*set cue point to start of loop*/
		engine.setValue(group, "cue_point", loopStartPos);

	}
	else if(c.nudgeMode[index]==2)
	{
		/*set loop boundaries end*/
		var loopEndPos=engine.getValue(group, "loop_end_position");
		print("LOOP END "+loopEndPos);

		/*ccw*/
		if(value==63)
		{
			loopEndPos-=step;
		}
		/*cw 65*/
		else
		{
			loopEndPos+=step;

		}
		engine.setValue(group, "loop_end_position", loopEndPos);
	}
	else if(c.nudgeMode[index]==3)
	{
		/*set loop boundaries start and end*/
		var loopStartPos=engine.getValue(group, "loop_start_position");
		print("LOOP START "+loopStartPos);

		var loopEndPos=engine.getValue(group, "loop_end_position");
		print("LOOP END "+loopEndPos);

		/*ccw*/
		if(value==63)
		{
			loopStartPos-=step;
			loopEndPos-=step;
		}
		/*cw 65*/
		else
		{
			loopStartPos+=step;
			loopEndPos+=step;
		}

		engine.setValue(group, "loop_start_position", loopStartPos);

		/*set cue point to start of loop*/
		engine.setValue(group, "cue_point", loopStartPos);

		engine.setValue(group, "loop_end_position", loopEndPos);
	}
	else
	{
		/*if not setting start or end, do track list browsing*/
		/*ccw*/
		if(value==63)
		{
			engine.setValue(c.playlist, "SelectPrevTrack", 1);
		}
		/*cw 65*/
		else
		{
			engine.setValue(c.playlist, "SelectNextTrack", 1);

		}
	}
}; /*end c.PrevNextWheel*/

c.LoadSelectedTrack = function(channel, control, value, status, group)
{
	/*if pressed, will stop (if playing), load track and play at once*/
	if(value==c.keyPressed)
	{
		engine.setValue(group, "play", 0);
		engine.setValue(group, "LoadSelectedTrackAndPlay", 1);
	}
};

c.LoopIn = function(channel, control, value, status, group)
{
	if(value==c.keyPressed)
	{
		/*engine.setValue(group, "loop_in", 1);*/
		/*set cue point to start of loop*/
		engine.setValue(group, "cue_set", 1);
		/*use cue point for current position since we can't get this information otherwise*/
		var loopStart=engine.getValue(group, "cue_point");
		engine.setValue(group, "loop_start_position", loopStart);
		c.LED(control, 1, group);
	}
};

c.LoopOut = function(channel, control, value, status, group)
{
	if(value==c.keyPressed)
	{
		/*engine.setValue(group, "loop_out", 1);*/
		/* use unassigned hotcue to get current playposition */
		engine.setValue(group, "hotcue_5_clear", 1);
		engine.setValue(group, "hotcue_5_set", 1);
		var loopEnd=engine.getValue(group, "hotcue_5_position");
		engine.setValue(group, "loop_end_position", loopEnd);
		if(!engine.getValue(group, "loop_enabled"))
		{
			engine.setValue(group, "reloop_toggle", 1);
		}
		engine.setValue(group, "hotcue_5_clear", 1);
	}
};

c.ToggleBlinkBeats = function(channel, control, value, status, group)
{
	if(value==c.keyPressed)
	{
		var index=c.GetIndex(group);
		if(c.blinkBeats[index]==1)
		{
			c.blinkBeats[index]=0;
		}
		else
		{
			c.blinkBeats[index]=1;
		}
	}
};

/*==========================================================================*/
/*On event methods (from engine)*/
/*==========================================================================*/

c.OnLoopEnabled = function(value, group)
{
	c.LED(c.i.loop_in, value, group);
	c.LED(c.i.loop_out, value, group);
};

c.OnBeatActive = function(value, group)
{
	var index=c.GetIndex(group);
	if(c.blinkBeats[index]==1 && value==1)
	{
		c.LED(c.i.filter, 1, group);
		/*print("BEAT "+group);*/

		/*one shot timer to turn off led after 50 ms*/
		engine.beginTimer(50,'c.LEDOff(c.i.filter, "'+group+'")',true);
	}
};

/*some c.Onxxx get created via map()*/

c.OnHotcue1_1 = function(value, group)
{
	c.LED(c.i._1,value, group);
};

c.OnHotcue1_2 = function(value, group)
{
	c.LED(c.i._2,value, group);
};

c.OnHotcue1_3 = function(value, group)
{
	c.LED(c.i._3,value, group);
};

c.OnHotcue1_4 = function(value, group)
{
	c.LED(c.i._4,value, group);
};

c.OnChannelPlaying = function(value, group,event)
{
		if(value==0)
		{
			c.LED(c.i.play_pause, 0, group);
			c.LED(c.i.cue, 0, group);
		}
		else
		{	/*if deck is playing but not in CUE modus*/
			if( engine.getValue(group, "cue_default")==0)
			{
				c.LED(c.i.play_pause, 1, group);
			}
		}
};

c.OnChannelCueActive = function(value, group, event)
{
	if(value==0)
	{
		c.LED(c.i.cue, 0, group);
	}
	else
	{
		c.LED(c.i.cue, 1, group);
	}
};

/*==========================================================================*/
/*HELPERS*/
/*==========================================================================*/

/*index off by 1*/
c.GetIndex = function(group)
{
	if(group=="[Channel1]")
	{
		return 0;
	}
	else if(group=="[Channel2]")
	{
		return 1;
	}
	else if(group=="[Channel3]")
	{
		return 2;
	}
	else if(group=="[Channel4]")
	{
		return 3;
	}
	else if(group=="[Channel5]")
	{
		return 4;
	}
	else if(group=="[Channel6]")
	{
		return 5;
	}
	else if(group=="[Channel7]")
	{
		return 6;
	}
	else if(group=="[Channel8]")
	{
		return 7;
	}
};

c.LED = function(control, isOn, group)
{
	if(isOn==1)	
	{
		c.LEDOn(control, group);
	}
	else
	{
		c.LEDOff(control, group);
	}
};

c.LEDOn = function(control, group)
{
	var index=c.GetIndex(group);
	eval('midi.sendShortMsg(0x9'+index+', control, c.ledOn);');
};

c.LEDOff = function(control, group)
{
	var index=c.GetIndex(group);
	eval('midi.sendShortMsg(0x9'+index+', control, c.ledOff);');
};

c.EvalSetPitchLED = function(group)
{
	var index=c.GetIndex(group);
	if(c.pitchAtZero[index]==1 || c.pitchLocked[index]==1)
	{
		c.LED(c.i.pitch_0, 1, group);
	}
	else
	{
		c.LED(c.i.pitch_0, 0, group);
	}
};

/*EOF*/
