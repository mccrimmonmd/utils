REM TODO: set up Winux thing

REM If WinGet isn't already installed (PowerShell):
REM Add-AppxPackage -RegisterByFamilyName -MainPackage Microsoft.DesktopAppInstaller_8wekyb3d8bbwe

REM Use cmd.exe instead of PowerShell to have apps added to Path automatically:
winget install git.git
winget install vim.vim
winget install node.js
winget install python.python
winget install chocolatey
REM ...

cd ~\Documents\Git
git clone https://github.com/mccrimmonmd/utils.git
cd utils
copy .gitconfig ~\
copy _vimrc ~\
REM copy <.ps config file> ~\

REM clone any other repos?

REM Install Chocolatey without WinGet (PowerShell):
REM Set-ExecutionPolicy AllSigned -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
