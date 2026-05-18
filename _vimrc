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
  " run Prettier when tab or window loses focus(?) on JS files(?)
  " autocmd BufLeave,FocusLost *.js Prettier
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
" noremap <Leader>ss :mks ~/Documents/Git/utils/sessions/
" noremap <Leader>sm :mks! ~/Documents/Git/utils/sessions/main.vim <CR>
" noremap <Leader>sc :mks! ~/Documents/Git/utils/sessions/coding.vim <CR>
" noremap <Leader>ll :so ~/Documents/Git/utils/sessions/
" noremap <Leader>lm :so ~/Documents/Git/utils/sessions/main.vim <CR>
" noremap <Leader>lc :so ~/Documents/Git/utils/sessions/coding.vim <CR>
"
" TODO:
"   - figure out how to load a session only when opening a 'null' window
"   - ~~figure out how to automatically load .vim files as sessions~~ (while
"   still allowing them to be edited somehow)
"   - use `M/C/E/n` options on exit to save session as main, coding, or new
"
" augroup malGvimrc
"   autocmd!
"   autocmd BufLeave,FocusLost * silent! wall
"   autocmd VimEnter *.vim :so <afile>
"   autocmd VimLeavePre * let g:save_session=input("Save session? (Y/n) ")
"   autocmd VimLeave * if g:save_session == "Y" | :mks! ~/Documents/Git/utils/sessions/main.vim | endif
" augroup END

