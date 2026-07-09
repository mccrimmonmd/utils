unlet! skip_defaults_vim
source $VIMRUNTIME/defaults.vim

inoremap jj <ESC>
nnoremap <C-j> i<CR><ESC>
nnoremap <C-o> o<ESC>
nnoremap <A-o> O<ESC>

nnoremap <C-PageUp> <C-PageDown>
nnoremap <C-PageDown> <C-PageUp>

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
  " change .swp files to the actual file (no accidentally opening swap files)
  " autocmd VimEnter *.swp :e (...)
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
" noremap <Leader>ss :mks! ~/Documents/Git/utils/sessions/
" noremap <Leader>sm :mks! ~/Documents/Git/utils/sessions/main.vim <CR>
" noremap <Leader>sc :mks! ~/Documents/Git/utils/sessions/coding.vim <CR>
" noremap <Leader>ll :so ~/Documents/Git/utils/sessions/
" noremap <Leader>lm :so ~/Documents/Git/utils/sessions/main.vim <CR>
" noremap <Leader>lc :so ~/Documents/Git/utils/sessions/coding.vim <CR>
"
" TODO:
"   - ~~figure out how to automatically load .vim files as sessions~~ (while
"   still allowing them to be edited somehow)
"   - figure out how to load a session only when opening a 'null' window
"   (otherwise, edit it)
"   - do the same for .swp files (but only in gVim, so console vim sessions
"   still edit the non-swap file)
"   - use `M/C/E/n` options on exit to save session as main, coding, or new
"   - run Prettier when tab/window loses focus(?) on JS files(?) in gVim(?)
"   `autocmd BufLeave,FocusLost *.js Prettier`
"
" augroup malGvimrc
"   autocmd!
"   autocmd BufLeave,FocusLost * silent! wall
"   autocmd VimEnter *.vim :so <afile>
"   autocmd VimLeavePre * let g:save_session=input("Save session? (Y/n) ")
"   autocmd VimLeave * if g:save_session == "Y" | :mks! ~/Documents/Git/utils/sessions/main.vim | endif
" augroup END

