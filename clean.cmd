
DEL /S *.NCB
DEL /S *.OPT
DEL /S *.PLG
DEL /S *.EXP
DEL /S *.ILK
DEL /S *.OBJ
DEL /S *.IDB
DEL /S *.PDB
DEL /S *.MAP
DEL /S *.SDF
DEL /S *.IOBJ
DEL /S *.IPDB
DEL /S *.SDB
DEL /S *.DB
DEL /S .DS_Store
DEL /S *.dSYM
CD bin
DEL /S *.lib
CD ..

RMDIR /S /q build\windows\.vs
RMDIR /S /q build\windows\bin
RMDIR /S /q build\windows\obj
