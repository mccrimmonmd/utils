unlet! skip_defaults_vim
source $VIMRUNTIME/defaults.vim


set relativenumber

inoremap jj <ESC>
nnoremap <silent> <C-l> :nohlsearch<CR><C-l>
let mapleader = " "

noremap <Leader>s :mks! ~/Documents/session.vim
noremap <Leader>l :so ~/Documents/session.vim
noremap <Leader>d :w !diff % - <CR>

" these don't work?
" nnoremap ; :
" cnoreabbrev H vert bo h
" let &t_SI = "\e[0 q"

set hlsearch
set ignorecase
set smartcase

set shiftwidth=2 smarttab
set expandtab
set tabstop=8 softtabstop=0

autocmd BufLeave,FocusLost * silent! wall

