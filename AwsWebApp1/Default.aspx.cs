using System;
using System.Web;
using System.Web.Services;
using System.Web.UI;
using RH.Core.Helpers;
using RH.WebCore;

namespace AwsWebApp1
{
    public partial class WebForm1 : Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
        }

        [WebMethod]
        public static string LoadP(string a)
        {
            var creator = new ObjCreator();
            return creator.Test();
        }

        [WebMethod]
        public static string CropImage(string path)
        {
            try
            {
                CropHelper.WebCropImage(path, HttpContext.Current.Session.SessionID);
            }
            catch (Exception ex)
            {
                return ex.Message;
            }
            return HttpContext.Current.Session.SessionID;
        }

        [WebMethod]
        public static string LoadModel(int currentType, string sessionID, string hairPath, string hairMaterialPath, string accessoriesPath, string accessoriesMaterialPath, string basePath, string baseMaterialPath, string addonPath1, string addonPath2, string addonPath3, string addonPath4, string addonMaterialPath, int ageValue, int fatValue, int smoothingValue, int size, string orderID)
        {
            try
            {
                var creator = new ObjCreator();
                creator.CreateObj(currentType, sessionID, hairPath, hairMaterialPath, accessoriesPath, accessoriesMaterialPath, basePath, baseMaterialPath, addonPath1, addonPath2, addonPath3, addonPath4, addonMaterialPath, ageValue, fatValue, smoothingValue, size, orderID);
            }
            catch (Exception ex)
            {
                return ex.Message;
            }
            return HttpContext.Current.Session.SessionID;
        }

        [WebMethod]
        public static string CheckFileExists(string path)
        {
            return FTPHelper.IsFileExists(path) ? HttpContext.Current.Session.SessionID : "bad";
        }

        [WebMethod]
        public static double GetFaceAngle(string sessionId)
        {
            return ObjCreator.GetFaceAngle(sessionId);
        }
    }
}