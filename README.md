# Whitepen Scanner

This is the README for Whitepen Scanner. The main concept of this scanner is to detect vulnerabilites in the installed packages.

## Registration

First step is to make registartion by email on https://theateam.xyz

## Login

After installing WhitePen extension, you have to login by clicking on "Connect VS Code with WhitePen"

![Login](media/images/login.png)

## Run Package Checker

After Logging in, the package checker will run automatically or by clicking ctrl+shift+p and choosing command <span style="color: #008ae6"> WhitePen: Start WhitePen Dependencies Scanner</span>

![Login](media/images/dep_scan.png)

## Show Vulnerable Package

After running package checker, the vulnerable packages will appear on the left side.

![Login](media/images/vuln_packages.png)

## Show CVEs

After clicking on one of the vulnerable packages a new tab will appear under it showing the cves contained on the selected package with the colored icon based on the severity of each cve.

![Login](media/images/cve_info.png)

## Show CVE Information

You can view the information of each cve by clicking on it. A new tab will open on the right side showing its information.

![Login](media/images/cve_details.png)

## Logout

You can Logout from the extension by executing command ctrl+shift+p <span style="color: #008ae6"> WhitePen: Logout From WhitePen</span>

![Login](media/images/logout.png)
