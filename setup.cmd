REM TODO: set up Linux-on-Win thing

REM If WinGet isn't already installed:
REM Add-AppxPackage -RegisterByFamilyName -MainPackage Microsoft.DesktopAppInstaller_8wekyb3d8bbwe

REM Use cmd.exe instead of PowerShell to have apps added to Path automatically:
winget install git.git
winget install vim.vim
winget install node.js
winget install python.python.3.13
winget install chocolatey
REM ...

REM For PowerShell, use ~ instead--no variable that works in both :'(
cd %USERPROFILE%\Documents\Git
git clone https://github.com/mccrimmonmd/utils.git
cd utils
copy .gitconfig %USERPROFILE%\
copy _vimrc %USERPROFILE%\
REM copy <.ps config file> %USERPROFILE%\

REM clone any other repos?

REM Install Chocolatey without WinGet:
REM Set-ExecutionPolicy AllSigned -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
