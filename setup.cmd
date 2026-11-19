REM Run as admin and use cmd.exe (if you use PowerShell, apps don't get added to Path automatically)

REM If WinGet isn't already installed:
REM powershell -Command "Add-AppxPackage -RegisterByFamilyName -MainPackage Microsoft.DesktopAppInstaller_8wekyb3d8bbwe"

REM TODO: set up WSL
REM TODO: set registry to disable after-snap (Win+direction) popup
REM TODO: create node 'startup' script (noodle?) for ps and bash, add to path
REM     (Script would start a REPL with utils automatically loaded)

winget install git.git
winget install vim.vim
winget install node.js
winget install python.python.3.13
winget install chocolatey

REM after running this command and copying _vimrc, run :PlugInstall in vim to complete vim-plug installation
powershell -Command "iwr -useb https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim | ni $HOME/vimfiles/autoload/plug.vim -Force"

REM install rust
REM install vscode(?)
REM install duckduckgo(?)
REM ...
winget update
winget upgrade

REM For PowerShell, use ~ instead--no variable that works in both :'(
mkdir %USERPROFILE%\Documents\Git
cd %USERPROFILE%\Documents\Git
git clone https://github.com/mccrimmonmd/utils.git
cd utils
copy .gitconfig %USERPROFILE%\
copy .prettierrc %USERPROFILE%\
copy _vimrc %USERPROFILE%\
REM copy <.ps config file> %USERPROFILE%\

REM clone any other repos?

REM Install Chocolatey without WinGet (PowerShell):
REM Set-ExecutionPolicy AllSigned -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
