using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Security;
using System.Web.SessionState;
using System.Web.UI.WebControls;

namespace AwsWebApp1
{
    public class Global : System.Web.HttpApplication
    {

        protected void Application_Start(object sender, EventArgs e)
        {
            /*   var searchPath = @"C:\Windows\SysWOW64\inetsrv";
               var oldPath = @"C:\Windows\system32\inetsrv";
               var oldPath1 = @"C:\Windows\system32\inetsrv\bin";
               var path = @"C:\Windows\SysWOW64\inetsrv\bin";
               var q = AppDomain.CurrentDomain.BaseDirectory;      // C:\inetpub\wwwroot\          // тут лежит что надо! есть папка bin
               var q1 = Path.Combine(AppDomain.CurrentDomain.BaseDirectory,"bin");
               var p = Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location);  // тут хуйня, два файла лежит и все.  //C:\Windows\Microsoft.NET\Framework\v4.0.30319\Temporary ASP.NET Files\root\26676eb7\92c7e946\assembly\dl3\4efbb
               var p1 = Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location) + @"\bin";*/

            System.Environment.SetEnvironmentVariable("PATH", Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "bin"));
        }

        protected void Session_Start(object sender, EventArgs e)
        {

        }

        protected void Application_BeginRequest(object sender, EventArgs e)
        {

        }

        protected void Application_AuthenticateRequest(object sender, EventArgs e)
        {

        }

        protected void Application_Error(object sender, EventArgs e)
        {

        }

        protected void Session_End(object sender, EventArgs e)
        {

        }

        protected void Application_End(object sender, EventArgs e)
        {

        }
    }
}