/****************************************************************/
/*      Reloop RMP-3 Cross Media Player controller script v2.0  */
/*      Feel free to tweak!                                     */
/*      Works best with Mixxx version 1.11.x                    */
/*      Overview on Bindings:  http://lowres.ch/rmp3/index.html */
/****************************************************************/

/*//tb/130407/130520/130608*/

function c() {};

/*needed in xml*/
c.name_='Reloop RMP-3';
c.author_='Thomas Brand';
c.description_='Custom Bindings for Reloop RMP-3 Cross Media Player';
c.controller_id_='RMP-3';
c.channelCount_=2;
c.function_prefix_='c';
/*name of javascript file (this)*/
c.js_file_='Reloop-RMP-3-scripts.js';
c.script_version_='2.0';

/*common midi values*/
c.ledOn = 0x7F;
c.ledOff = 0x00;
c.keyPressed = 0x7F;
c.keyUp = 0x00;

/*array holding all control 'objects'*/
c.controls=new Array();

c.script_binding='<script-binding/>';
c.normal='<normal/>';
c.channel='[Channel]';
c.playlist='[Playlist]';

/*pitch range of fader 4 - 100%*/
c.rateRange=new Array(4);
c.rateRange[0]=0.04;
c.rateRange[1]=0.08;
c.rateRange[2]=0.16;
c.rateRange[3]=1.00;

c.currentRateRange=new Array(2);
c.currentRateRange[0]=1;
c.currentRateRange[1]=1;

c.scratchMode = new Array(2);
c.scratchMode[0] = 0;
c.scratchMode[1] = 0;

/*1 (fast) - 3 (slow)*/
/*used for jog scratch and loop nudge*/
c.sensitivity = new Array(2);
c.sensitivity[0]=1;
c.sensitivity[1]=1;

/*0: none, 1: start, 2: end*/
c.nudgeMode = new Array(2);
c.nudgeMode[0]=0;
c.nudgeMode[1]=0;

/*==========================================================================*/
/*map: create control object and put to controls array*/
/*==========================================================================*/

/*template to create map objects*/
c.map=function(status,midino,group,key,description,option,connect)
{
	for(var i=0;i<c.channelCount_;i++)
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
			var str_='c.On'+key+' = function (value,group)';
			str_+='{';
			str_+='c.led_('+midino+',value,group);';
			str_+='};';

			/*group,key,callback*/
			str_+='engine.connectControl( "'+group_+'","'+key+'","c.On'+key+'");';

			/*print(str_);*/
			eval(str_);
		}

		str+='c.controls.push('+control_name+');';

		/*print(str);*/
		eval(str);

	} /*end for channel count*/
};

/*print mixxx xml from meta data and mappings*/
c.x=function(tag,content){return '<'+tag+'>'+content+'</'+tag+'>';};

c.printXml=function()
{
	var d=new Date();
	var out='<MixxxMIDIPreset mixxxVersion="1.11.0+" schemaVersion="1">';
	out+='<!-- created '+d+' -->';

	out+=c.x('info',
		c.x('name',c.name_)
		+c.x('author',c.author_)
		+c.x('description',c.description_)
	);

	out+='<controller id="'+c.controller_id_+'">';
	out+=c.x('scriptfiles','<file functionprefix="'+c.function_prefix_+'" filename="'+c.js_file_+'"/>');
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
	,track:			'0x2b' /*press*/

/*pitchbend event*/
	,pitch_slider:		'0xe0' 

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
c.map("0x9",c.i.play_pause,c.channel,"c.playTrack","",c.script_binding,0);
c.map("0x9",c.i.cue	,c.channel,"c.Cue","",c.script_binding,0);

c.map("0x9",c.i.b1_1	,c.channel,"filterHighKill","",c.normal,1);
c.map("0x9",c.i.b2_1	,c.channel,"filterMidKill","",c.normal,1);
c.map("0x9",c.i.b4_1	,c.channel,"filterLowKill","",c.normal,1);
c.map("0x9",c.i.skid	,c.channel,"repeat","",c.normal,1);
c.map("0x9",c.i.filter	,c.channel,"beats_translate_curpos","",c.normal,1);
c.map("0x9",c.i.phase	,c.channel,"quantize","",c.normal,1);
c.map("0x9",c.i.keylock	,c.channel,"keylock","",c.normal,1);

c.map("0x9",c.i.time	,c.channel,"start","",c.normal,0);
c.map("0x9",c.i.bank_p	,c.playlist,"SelectPrevPlaylist","",c.normal,0);
c.map("0x9",c.i.sgl_ctn	,c.playlist,"SelectNextPlaylist","",c.normal,0);

c.map("0x9",c.i._1	,c.channel,"hotcue_1_activate","",c.normal,0);
c.map("0x9",c.i._2	,c.channel,"hotcue_2_activate","",c.normal,0);
c.map("0x9",c.i._3	,c.channel,"hotcue_3_activate","",c.normal,0);
c.map("0x9",c.i._4	,c.channel,"hotcue_4_activate","",c.normal,0);
c.map("0x9",c.i._1_shift,c.channel,"hotcue_1_clear","",c.normal,0);
c.map("0x9",c.i._2_shift,c.channel,"hotcue_2_clear","",c.normal,0);
c.map("0x9",c.i._3_shift,c.channel,"hotcue_3_clear","",c.normal,0);
c.map("0x9",c.i._4_shift,c.channel,"hotcue_4_clear","",c.normal,0);
c.map("0x9",c.i.bpm,c.channel,"beatsync_tempo","",c.normal,0);
c.map("0x9",c.i.save_to	,c.channel,"loop_halve","",c.normal,0);
c.map("0x9",c.i.sampler	,c.channel,"loop_double","",c.normal,0);
c.map("0x9",c.i.minus	,c.channel,"rate_temp_down_small","",c.normal,0);
c.map("0x9",c.i.plus	,c.channel,"rate_temp_up_small","",c.normal,0);

c.map("0x9",c.i.track	,c.channel,"c.LoadSelectedTrack","",c.script_binding,0);
c.map("0x9",c.i.jog_top	,c.channel,"c.JogWheel_Hold","",c.script_binding,0);
c.map("0x9",c.i.scratch	,c.channel,"c.Scratch","",c.script_binding,0);
c.map("0x9",c.i.prev	,c.channel,"c.nudgeLoopStart","",c.script_binding,0);
c.map("0x9",c.i.next	,c.channel,"c.nudgeLoopEnd","",c.script_binding,0);
c.map("0x9",c.i.loop_in	,c.channel,"c.LoopIn","",c.script_binding,0);
c.map("0x9",c.i.loop_out,c.channel,"c.LoopOut","",c.script_binding,0);
c.map("0x9",c.i.reloop	,c.channel,"c.ReloopExit","",c.script_binding,0);
c.map("0x9",c.i.percent	,c.channel,"c.changeRateRange","",c.script_binding,0);
c.map("0x9",c.i.pitch_slider_center,c.channel,"c.pitchZero","",c.script_binding,0);
c.map("0x9",c.i.tap	,c.channel,"c.beat_tap","",c.script_binding,0);
c.map("0x9",c.i.flanger	,c.channel,"c.sensitivity1","",c.script_binding,0);
c.map("0x9",c.i.trans	,c.channel,"c.sensitivity2","",c.script_binding,0);
c.map("0x9",c.i.pan	,c.channel,"c.sensitivity3","",c.script_binding,0);

c.map("0xb","0x71",c.playlist,"c.PrevNextWheelShift","",c.script_binding,0);
c.map("0xb",c.i.track_wheel,c.channel,"c.PrevNextWheel","",c.script_binding,0);
c.map("0xb",c.i.jog_shift,c.channel,"c.JogZoom","",c.script_binding,0);
c.map("0xb",c.i.jog	,c.channel,"c.JogWheel","",c.script_binding,0);
c.map("0xb",c.i.search	,c.channel,"c.back_fwd","",c.script_binding,0);

c.map("0xe","0x5e"	,c.channel,"rate","",c.normal,0);

/*javascript host can call this method to get xml*/
/*c.printXml();*/

/*==========================================================================*/
/*common function (called by mixxx at startup/load control interface)*/
/*==========================================================================*/

c.init = function(id)
{
	print ("Initalizing Reloop RMP-3...");

	c.resetLEDs();
	c.connectEvents();
	c.setInitialValues();

	print("RPM-3 READY.");

}; /*end c.init*/

/*c.setInitialValues = function(group)*/
c.setInitialValues = function()
{
	for(var i=0;i<c.channelCount_;i++)
	{
		var group='[Channel'+(i+1)+']';

		var index=c.getIndex_(group);

		/*read current states to initially set indications*/
		/*+/- 8%*/
		engine.setValue(group,"rateRange",c.rateRange[c.currentRateRange[index]]);
		engine.setValue(group,"rate_dir",-1);

		/*turn on defaults*/
		/*pitch 8%*/
		c.led_(c.i.pitch_8,1,group);

		/*sensitivity 1*/
		c.led_(c.i.flanger,1,group);

		if(engine.getValue(group,"play"))
		{
			c.led_(c.i.play_pause,1,group);
		}
		if(engine.getValue(group,"filterHighKill"))
		{
			c.led_(c.i.b1_1,1,group);
		}
		if(engine.getValue(group,"filterMidKill"))
		{
			c.led_(c.i.b2_1,1,group);
		}
		if(engine.getValue(group,"filterLowKill"))
		{
			c.led_(c.i.b4_1,1,group);
		}
		if(engine.getValue(group,"keylock"))
		{
			c.led_(c.i.keylock,1,group);
		}
		if(engine.getValue(group,"repeat"))
		{
			c.led_(c.i.skid,1,group);
		}
		if(engine.getValue(group,"quantize"))
		{
			c.led_(c.i.phase,1,group);
		}
		if(engine.getValue(group,"hotcue_1_enabled"))
		{
			c.led_(c.i._1,1,group);
		}
		if(engine.getValue(group,"hotcue_2_enabled"))
		{
			c.led_(c.i._2,1,group);
		}
		if(engine.getValue(group,"hotcue_3_enabled"))
		{
			c.led_(c.i._3,1,group);
		}
		if(engine.getValue(group,"hotcue_4_enabled"))
		{
			c.led_(c.i._4,1,group);
		}
		if(engine.getValue(group,"loop_enabled"))
		{
			c.led_(c.i.loop_in,1,group);
			c.led_(c.i.loop_out,1,group);
		}
	}/*end for channelcount*/

}; /*end c.setInitialValues*/

/*c.connectEvents = function(group)*/
c.connectEvents = function()
{
	for(var i=0;i<c.channelCount_;i++)
	{
		var group='[Channel'+(i+1)+']';

		/*connect to events*/
		engine.connectControl(group,"play","c.OnChannelPlaying");
		engine.connectControl(group,"cue_default","c.OnChannelCueActive");

		engine.connectControl(group,"hotcue_1_enabled","c.OnHotcue1_1");
		engine.connectControl(group,"hotcue_2_enabled","c.OnHotcue1_2");
		engine.connectControl(group,"hotcue_3_enabled","c.OnHotcue1_3");
		engine.connectControl(group,"hotcue_4_enabled","c.OnHotcue1_4");

		engine.connectControl(group,"loop_enabled","c.OnLoopEnabled");
		/*engine.connectControl(group,"beat_active","c.OnBeatActive");*/

		/*more connections done via map()*/

	} /*end for channelcount*/
}; /*end c.connectEvents*/

/*c.resetLEDs = function(group)*/
c.resetLEDs = function()
{
	for(var i=0;i<c.channelCount_;i++)
	{
		var group='[Channel'+(i+1)+']';

		/*Turn all LEDS off*/
		c.led_(c.i.play_pause,0,group);
		c.led_(c.i.cue,0,group);
		c.led_(c.i.loop_in,0,group);
		c.led_(c.i.loop_out,0,group);
		c.led_(c.i.b1_1,0,group);
		c.led_(c.i.b2_1,0,group);
		c.led_(c.i.b4_1,0,group);
		c.led_(c.i._1,0,group);
		c.led_(c.i._2,0,group);
		c.led_(c.i._3,0,group);
		c.led_(c.i._4,0,group);
		c.led_(c.i.scratch,0,group);
		c.led_(c.i.skid,0,group);
		c.led_(c.i.scratch,0,group);	
		c.led_(c.i.phase,0,group);
		c.led_(c.i.pitch_4,0,group);
		c.led_(c.i.pitch_8,0,group);
		c.led_(c.i.pitch_16,0,group);	
		c.led_(c.i.pitch_100,0,group);
		c.led_(c.i.keylock,0,group);
		c.led_(c.i.pitch0,0,group);
		c.led_(c.i.flanger,0,group);
		c.led_(c.i.trans,0,group);
		c.led_(c.i.pan,0,group);
	}
}; /*end c.resetLEDs*/

c.shutdown = function(id)
{
	/*Turn all LEDs off by using init function*/
	c.resetLEDs();
};

c.nudgeLoopStart = function (channel, control, value, status, group)
{
	var index=c.getIndex_(group);
	if(value == c.keyPressed)
	{
		c.nudgeMode[index]=1;
	}
	else
	{
		c.nudgeMode[index]=0;
	}
};

c.nudgeLoopEnd = function (channel, control, value, status, group)
{
	var index=c.getIndex_(group);
	if(value == c.keyPressed)
	{
		c.nudgeMode[index]=2;
	}
	else
	{
		c.nudgeMode[index]=0;
	}
};

c.changeRateRange = function (channel, control, value, status, group)
{
	var index=c.getIndex_(group);
	if(value == c.keyPressed)
	{
		c.currentRateRange[index]++;
		if(c.currentRateRange[index]>3)
		{
			c.currentRateRange[index]=0;
		}

		/*print("change rate range "+RMP3.rateRange[RMP3.currentRateRange[index]]);*/
		engine.setValue(group,"rateRange",c.rateRange[c.currentRateRange[index]]);

		if(c.currentRateRange[index]==0)
		{
			c.led_(c.i.pitch_4,1,group);
			c.led_(c.i.pitch_8,0,group);
			c.led_(c.i.pitch_16,0,group);
			c.led_(c.i.pitch_100,0,group);
		}
		else if(c.currentRateRange[index]==1)
		{
			c.led_(c.i.pitch_4,0,group);
			c.led_(c.i.pitch_8,1,group);
			c.led_(c.i.pitch_16,0,group);
			c.led_(c.i.pitch_100,0,group);
		}
		else if(c.currentRateRange[index]==2)
		{
			c.led_(c.i.pitch_4,0,group);
			c.led_(c.i.pitch_8,0,group);
			c.led_(c.i.pitch_16,1,group);
			c.led_(c.i.pitch_100,0,group);
		}
		else if(c.currentRateRange[index]==3)
		{
			c.led_(c.i.pitch_4,0,group);
			c.led_(c.i.pitch_8,0,group);
			c.led_(c.i.pitch_16,0,group);
			c.led_(c.i.pitch_100,1,group);
		}
	}
}; /*end c.changeRateRange*/

c.pitchZero = function (channel, control, value, status, group)
{
	if(value == c.keyPressed)
	{
		engine.setValue(group,"rate",0);
		c.led_(c.i.pitch_0,1,group);
	}
	else
	{
		c.led_(c.i.pitch_0,0,group);
	}
};

c.beat_tap = function (channel, control, value, status, group)
{
	if(value == c.keyPressed)
	{
		engine.setValue(group,"bpm_tap",1);
	}
};

c.back_fwd = function (channel, control, value, status, group)
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
};

c.playTrack = function (channel, control, value, status, group) 
{
	/*no action of no song loaded to deck*/
	if (engine.getValue(group, "duration") == 0) 
	{ 
		return; 
	}

	var isCupActive = engine.getValue(group,"cue_default");
	if(isCupActive == true)
	{
		/*allow to change from cue to play mode (press play while cue hold, then let go cue)*/
		engine.setValue(group,"play",1);
		return;
	}

	var currentlyPlaying = engine.getValue(group,"play");
	if(value == c.keyPressed)
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
}; /*end c.playTrack*/

c.Cue = function (channel, control, value, status, group)
{
	/*no action of no song loaded to deck*/
	if (engine.getValue(group, "duration") == 0) 
	{ 
		return; 
	}

	if(value == c.keyPressed)
	{
		engine.setValue(group,"cue_default",1);
		c.led_(c.i.play_pause,0,group);
		c.led_(control,1,group);
	}
	else 
	{
		engine.setValue(group,"cue_default",0);
		c.led_(control,0,group);		
	}	
};

c.Scratch = function (channel, control, value, status, group)
{
	/*see hold*/
	if(value == c.keyPressed)
	{
		var index=c.getIndex_(group);
		if(c.scratchMode[index] == 1)
		{
			c.scratchMode[index] = 0;
			c.led_(control,0,group);
		}
		else
		{
			c.scratchMode[index] = 1;
			c.led_(control,1,group);
		}
	}
};

/*sensitivity 1*/
c.sensitivity1 = function (channel, control, value, status, group)
{
	var index=c.getIndex_(group);
	if(value == c.keyPressed)
	{
			c.sensitivity[index] = 1;
			c.led_(c.i.flanger,1,group);
			c.led_(c.i.trans,0,group);
			c.led_(c.i.pan,0,group);
	}
};

/*sensitivity 2*/
c.sensitivity2 = function (channel, control, value, status, group)
{
	var index=c.getIndex_(group);
	if(value == c.keyPressed)
	{
			c.sensitivity[index] = 2;
			c.led_(c.i.flanger,0,group);
			c.led_(c.i.trans,1,group);
			c.led_(c.i.pan,0,group);
	}
};

/*sensitivity 3*/
c.sensitivity3 = function (channel, control, value, status, group)
{
	var index=c.getIndex_(group);
	if(value == c.keyPressed)
	{
			c.sensitivity[index] = 3;
			c.led_(c.i.flanger,0,group);
			c.led_(c.i.trans,0,group);
			c.led_(c.i.pan,1,group);
	}
};

c.JogWheel = function (channel, control, value, status, group)
{
	/*values +/- around 64*/
	var jogValue = (value - 64); 
	/*print('jogwheel val: '+jogValue);*/

	var index=c.getIndex_(group);

	/*scratch*/
	if (c.scratchMode[index] == 1) 
	{
		engine.scratchTick(index+1,jogValue);
	}
	/*small speed changes*/
	else
	{
		/*-3 +3*/
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
}; /*end c.JogWheel*/

/*should distinguish playing/non-playing*/
c.JogWheel_Hold = function (channel, control, value, status, group)
{
	/*see scratch*/
	var index=c.getIndex_(group);

	if(c.scratchMode[index] == 0)
	{
		return;
	}

	if(value == c.keyPressed)
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

c.JogZoom = function (channel, control, value, status, group) 
{
	/*1-6*/
	engine.setValue(group,"waveform_zoom", ((value/127)*5+1));
};

c.PrevNextWheelShift = function (channel, control, value, status, group) 
{
	/*ccw*/
	if(value==63)
	{
		engine.setValue(c.playlist,"SelectTrackKnob", -10);
	}
	/*cw 65*/
	else
	{
		engine.setValue(c.playlist,"SelectTrackKnob", 10);
	}
};

c.PrevNextWheel = function (channel, control, value, status, group) 
{
	var index=c.getIndex_(group);

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
		engine.setValue(group, "loop_start_position",loopStartPos);

		/*set cue point to start of loop*/
		engine.setValue(group,"cue_point",loopStartPos);

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
		engine.setValue(group, "loop_end_position",loopEndPos);
	}
	else
	{
		/*if not setting start or end, do track list browsing*/
		/*ccw*/
		if(value==63)
		{
			engine.setValue(c.playlist,"SelectPrevTrack", 1);
		}
		/*cw 65*/
		else
		{
			engine.setValue(c.playlist,"SelectNextTrack", 1);

		}
	}
}; /*end c.PrevNextWheel*/

c.LoadSelectedTrack = function (channel, control, value, status, group) 
{
	/*if pressed, will stop (if playing), load track and play at once*/
	if(value == c.keyPressed)
	{
		engine.setValue(group,"play",0);
		engine.setValue(group, "LoadSelectedTrackAndPlay", 1);
	}
};

c.LoopIn = function (channel, control, value, status, group) 
{
	if(value == c.keyPressed)
	{
		engine.setValue(group,"loop_in",1);

		/*set cue point to start of loop*/
		engine.setValue(group,"cue_set",1);

		c.led_(control,1,group);
	}
};

c.LoopOut = function (channel, control, value, status, group) 
{
	if(value == c.keyPressed)
	{
		engine.setValue(group,"loop_out",1);
	}
};

c.ReloopExit = function (channel, control, value, status, group)
{
	if(value == c.keyPressed)
	{
		if(engine.getValue(group,"loop_enabled"))
		{
			engine.setValue(group,"reloop_exit",1);
		}
		else
		{
			/*doesn't work*/
			engine.setValue(group,"reloop_exit",0);
		}
	}
};

/*==========================================================================*/
/*On event methods (from engine)*/
/*==========================================================================*/

c.OnLoopEnabled = function (value,group)
{
	c.led_(c.i.loop_in,value,group);
	c.led_(c.i.loop_out,value,group);
};

c.beatLed=0;

/*
RMP3.OnBeatActive = function (value,group)
{
	if(value==1)
	{
		print("BEAT "+group);
	}
}
*/		

/*some c.Onxxx get created via map()*/

c.OnHotcue1_1 = function (value,group)
{
	c.led_(c.i._1,value,group);
};

c.OnHotcue1_2 = function (value,group)
{
	c.led_(c.i._2,value,group);
};

c.OnHotcue1_3 = function (value,group)
{
	c.led_(c.i._3,value,group);
};

c.OnHotcue1_4 = function (value,group)
{
	c.led_(c.i._4,value,group);
};


c.OnChannelPlaying = function (value,group,event)
{
		if(value == 0)
		{
			c.led_(c.i.play_pause,0,group);
			c.led_(c.i.cue,0,group);
		}
		else
		{	/*if deck is playing but not in CUE modus*/
			if( engine.getValue(group,"cue_default") == 0)
			{
				c.led_(c.i.play_pause,1,group);
			}
		}	
};

c.OnChannelCueActive = function (value,group,evemt)
{
	if(value == 0)
	{
		c.led_(c.i.cue,0,group);
	}
	else
	{
		c.led_(c.i.cue,1,group);
	}
};

/*==========================================================================*/
/*HELPERS*/
/*==========================================================================*/

/*index off by 1*/
c.getIndex_ = function (group)
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

c.led_ = function(control,isOn,group)
{
	if(isOn==1)	
	{
		c.lOn_(control,group);
	}
	else
	{
		c.lOff_(control,group);
	}
};

c.lOn_ = function(control,group)
{
	var index=c.getIndex_(group);
	eval('midi.sendShortMsg(0x9'+index+', control, c.ledOn);'); 
};

c.lOff_ = function(control,group)
{

	var index=c.getIndex_(group);
	eval('midi.sendShortMsg(0x9'+index+', control, c.ledOff);'); 
};
