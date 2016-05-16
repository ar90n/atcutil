#atcutil ?
AtCoderを少し便利に使えるスクリプトです．
テストケースの取得・評価，ソースコードの提出ができます．
自分が必要とす機能をとりあえず実装しただけなので，色々と不具合があります．

#使い方
###ログイン
```bash
$atcutil login
prompt: username:  ar90n
prompt: password:
Login successful
```

###テストケースの取得
```bash
$ atcutil fetch abc035
$ ls
abc035
$ ls abc035/
A_テレビ                       B_ドローン                     C_オセロ                        D_トレジャーハント
$ ls abc035/A_テレビ/
in_1.txt        in_2.txt        in_3.txt        out_1.txt       out_2.txt       out_3.txt
$ cat abc035/A_テレビ/in_1.txt
4 3
$ cat abc035/A_テレビ/out_1.txt
4:3
```

###テストケースの評価
```bash
$ ls
a        a.hs        in_1.txt        in_2.txt        in_3.txt        out_1.txt       out_2.txt       out_3.txt
$ atcutil test a
in_1.txt ... OK
in_2.txt ... OK
in_3.txt ... OK
````

###ソースコードの提出
````bash
$ atcutil submit a.hs
Submit successful
````

#License
This software is released under the MIT License, see LICENSE.txt.
