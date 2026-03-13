unlet! skip_defaults_vim
source $VIMRUNTIME/defaults.vim

inoremap jj <ESC>
nnoremap <C-j> i<CR><ESC>
nnoremap <C-o> o<ESC>
nnoremap <A-o> O<ESC>

set relativenumber

let mapleader = " "

noremap <Leader>s :mks! ~/Documents/session.vim<CR>
noremap <Leader>l :so ~/Documents/session.vim<CR>
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

" auto-save when tab or window loses focus (a la VS Code)
autocmd BufLeave,FocusLost * silent! wall

" *** GVIM SETTINGS ***
" set guifont=Cascadia\ Code:h11
" autocmd BufLeave,FocusLost * silent! wall

" TODO: figure out how to get these to apply only to 'canon' instance
" (otherwise, you can't have more than one window open at a time)
" autocmd VimEnter * :so ~/Documents/session.vim
" autocmd VimLeave * :mks! ~/Documents/session.vim

