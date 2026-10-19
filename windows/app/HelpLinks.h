#pragma once
// Generated from scripts/help-content.json. Exact trusted help destinations only.
inline bool AllowedHelpLink(const wchar_t* uri){
 if(!uri)return false;
 static const wchar_t* links[]={L"https://support.apple.com/guide/iphone/browse-the-web-privately-iphb01fc3c85/ios",L"https://support.apple.com/guide/iphone/iph168c4bbd5/ios",L"https://support.google.com/chrome/answer/2693767?co=GENIE.Platform%3DAndroid&hl=en",L"https://support.microsoft.com/en-us/teams/notifications-settings/manage-your-device-settings-in-microsoft-teams",L"https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0061836",L"https://support.microsoft.com/en-us/teams/meetings/my-camera-isn-t-working-in-microsoft-teams",L"https://github.com/sorenfroststaal/Extruda-Mobile-As-Webcam",L"https://github.com/sorenfroststaal/Extruda-Mobile-As-Webcam/blob/main/LICENSE",L"https://github.com/sorenfroststaal/Extruda-Mobile-As-Webcam/issues",L"https://github.com/sorenfroststaal/Extruda-Mobile-As-Webcam/blob/main/SECURITY.md"};
 for(const auto* link:links)if(wcscmp(uri,link)==0)return true;
 return false;
}
