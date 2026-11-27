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

