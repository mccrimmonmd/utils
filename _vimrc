unlet! skip_defaults_vim
source $VIMRUNTIME/defaults.vim

inoremap jj <ESC>
nnoremap <C-j> i<CR><ESC>
nnoremap <C-o> o<ESC>
nnoremap <A-o> O<ESC>

set relativenumber

let mapleader = " "

noremap <Leader>d :w !diff % - <CR>

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
  " auto-save when tab or window loses focus (a la VS Code)
  " autocmd BufLeave,FocusLost * silent! wall
augroup END

" *** GVIM SETTINGS ***
" set guifont=Cascadia\ Code:h11
"
" noremap <Leader>ss :mks ~/Documents/sessions/
" noremap <Leader>sm :mks! ~/Documents/sessions/main.vim <CR>
" noremap <Leader>sc :mks! ~/Documents/sessions/coding.vim <CR>
" noremap <Leader>ls :so ~/Documents/sessions/
" noremap <Leader>lm :so ~/Documents/sessions/main.vim <CR>
" noremap <Leader>lc :so ~/Documents/sessions/coding.vim <CR>
"
" TODO:
"   - figure out how to load a session only when opening a 'null' window
"   - figure out how to automatically load .vim files as sessions (while
"   still allowing them to be edited somehow)
"   - use `M/C/E/n` options on exit to save session as main, coding, or new
"
" augroup malGvimrc
"   autocmd!
"   autocmd BufLeave,FocusLost * silent! wall
"   autocmd VimEnter *.vim :so <afile>
"   autocmd VimLeavePre * let g:save_session=input("Save session? (Y/n) ")
"   autocmd VimLeave * if g:save_session == "Y" | :mks! ~/Documents/sessions/main.vim | endif
" augroup END

