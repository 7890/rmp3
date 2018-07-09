import javax.script.*;
import java.io.BufferedReader;
import java.io.FileReader;

//tb/130530

class mixxxml
{
	static String sScriptFile="";

	static ScriptEngine js;
	static ScriptEngineManager js_factory;
	static MIXXX_API api;

	public static void main(String[] args)
	{
		if(args.length>1)
		{
			mixxxml j=new mixxxml(args[0],args[1]);
		}
		else if(args.length>0)
		{
			mixxxml j=new mixxxml(args[0],"c");
		}
		else
		{
			p_("arguments: <javascript file> (<function prefix>: default c)");
		}
	}

	public mixxxml(String sFile,String sFunctionPrefix)
	{
		api=new MIXXX_API();

		js_factory=new ScriptEngineManager();
		js=js_factory.getEngineByName("JavaScript");

		sScriptFile=sFile;
		loadScript(sScriptFile);

		js_eval(sFunctionPrefix+".PrintXml();");

		System.exit(0);
	}

	//load / reload (all status is lost on reload)
	static void loadScript(String sJsUri)
	{
		if (js==null)
		{
			p_("ERR: error loading scripts: "+sJsUri);
			return;
		}

		try
		{
			Bindings js_bindings=js.createBindings();

			//mimic mixxx interface
			js_bindings.put("engine", api);
			js_bindings.put("midi", api);

			js.setBindings(js_bindings, ScriptContext.ENGINE_SCOPE);

			//p_(getAsString(sJsUri));
			js_eval(getAsString(sJsUri));
		}
		catch(Exception e)
		{
			p_("error loading js: "+e.getMessage());
		}
	}//end loadScripts()

	//evaluate javascript
	static Object js_eval(Object o)
	{
		if (js==null)
		{
			return null;
		}
		try
		{
			return js.eval(o.toString());
		}
		catch(Exception e)
		{
			p_("ERR: error evaluating js: "+e.getMessage());
		}
		return null;
	}

	//helpers
	static void e_(Object o)
	{
		System.err.println(""+o);
	}

	static void p_(Object o)
	{
		System.out.println(""+o);
	}

	static String getAsString(String sFile)
	{
		try
		{
			BufferedReader reader = new BufferedReader(new FileReader(sFile));
			//createReader(sFile);

			StringBuffer content = new StringBuffer();
			String sLine="";

			while (sLine!=null)
			{
				sLine=reader.readLine();
				if (sLine!=null)
				{
					content.append(sLine+"\n");
				}
			}
			return content.toString();
		}
		catch (Exception e)
		{
			e.printStackTrace();
		}
		return null;
	}

	//inner
	// ===========================================================================
	//make visible java functions to javascript over wrapper / API class
	public class MIXXX_API
	{
		public void print(String s)
		{
			p_(s);
		}
		public void error(String s)
		{
			e_(s);
		}

		/*fake*/
		/*for context engine*/
		public void connectControl(String group,String action, String callback)
		{
			e_("engine registered "+group+" "+action+" "+callback);
		}
		public int getValue(String group,String key)
		{
			e_("engine getValue "+group+" "+key);
			return 0;
		}
		public void setValue(String group,String key, int value)
		{
			e_("engine setValue "+group+" "+key+" "+value);
		}

		/*for context midi*/
		public void sendShortMsg(int status, int control, int led)
		{
			e_("midi sendshortmsg "+status+" "+control+" "+led);
		}
	}
}//end class js
//EOF
