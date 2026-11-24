unlet! skip_defaults_vim
source $VIMRUNTIME/defaults.vim

inoremap jj <ESC>
nnoremap <C-j> i<CR><ESC>
nnoremap <A-o> o<ESC>
nnoremap <A-O> O<ESC>

inoremap <C-PageUp> <C-PageDown>
inoremap <C-PageDown> <C-PageUp>
noremap <C-PageUp> <C-PageDown>
noremap <C-PageDown> <C-PageUp>

set relativenumber

let mapleader = " "

noremap <Leader>d :w !diff % - <CR>
noremap <Leader>so :w<CR>:so %<CR>

" these don't work?
" nnoremap ; :
" cnoreabbrev H vert bo h
" let &t_SI = "\e[0 q"

" search settings
nnoremap <silent> <C-l> :nohlsearch<CR><C-l>
set hlsearch
set ignorecase
set smartcase

set shiftwidth=2 smarttab
set expandtab
set tabstop=8 softtabstop=0

augroup malVimrc
  autocmd!
  " change .swp files to the actual file (no accidentally opening swap files)
  " autocmd VimEnter *.swp :e <afile>(minus .swp)
augroup END

call plug#begin()
  Plug 'rust-lang/rust.vim'
  Plug 'prettier/vim-prettier', {
  \ 'do': 'npm install -g',
  \ 'for': ['javascript', 'typescript', 'css', 'less', 'scss', 'json', 'graphql', 'markdown', 'vue', 'svelte', 'yaml', 'html'] }
call plug#end()

syntax enable
filetype plugin indent on

" *** GVIM SETTINGS ***
" set guifont=Cascadia\ Code:h11
" 
" function! SaveSession(sessionType)
"   let sessionType=a:sessionType
"   if sessionType == "?"
"     let sessionType=input("Options: E/M/C/D/<n>=savE/Main/Coding/Discard/<name> of new session: ")
"   endif
"   if sessionType == "M"
"     :mks! ~/Documents/sessions/main.vim
"   elseif sessionType == "C"
"     :mks! ~/Documents/sessions/coding.vim
"   elseif sessionType == "E"
"     :mks! ~/Documents/sessions/savedSession.vim
"   elseif sessionType == ""
"     :mks! ~/Documents/sessions/autosave.vim
"   elseif sessionType == "D"
"     :execute ""
"   else
"     :execute "mks! ~/Documents/sessions/" .. sessionType .. ".vim"
"   endif
" endfunction
" 
" noremap <Leader>ss :call SaveSession(input("session name: "))<CR>
" noremap <Leader>sm :call SaveSession("M")<CR>
" noremap <Leader>sc :call SaveSession("C")<CR>
" noremap <Leader>ll :so ~/Documents/sessions/
" noremap <Leader>lm :so ~/Documents/sessions/main.vim<CR>
" noremap <Leader>lc :so ~/Documents/sessions/coding.vim<CR>
" 
" TODO:
"   - ~~figure out how to automatically load .vim files as sessions (but
"   only in gVim, so console vim sessions still edit the non-vim file)~~
"   - do the same for .swp files (but in reverse?)
"   - figure out how to load a session only when opening a 'null' window
"   (otherwise, edit it)
"   - ~~use `M/C/E/n` options on exit to save session as main, coding, or new~~
"   - run Prettier when tab/window loses focus(?) on JS files(?) in gVim(?)
"   `autocmd BufLeave,FocusLost *.js Prettier`
"
" augroup malGvimrc
"   autocmd!
"   autocmd BufLeave,FocusLost * silent! wall
"   autocmd VimEnter *.vim :so <afile>
"   autocmd VimLeavePre * let s:save_session=input("Save session? E/M/C/D/?/<n> ")
"   autocmd VimLeave * call SaveSession(s:save_session)
" augroup END
" 
" call plug#begin()
"   Plug 'rust-lang/rust.vim'
"   Plug 'prettier/vim-prettier', {
"   \ 'do': 'npm install',
"   \ 'for': ['javascript', 'typescript', 'css', 'less', 'scss', 'json', 'graphql', 'markdown', 'vue', 'svelte', 'yaml', 'html'] }
" call plug#end()

