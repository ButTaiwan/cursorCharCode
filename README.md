# Here Unicode Mate
This extension is the best tool helps you work with Unicode and CJK encodings in Visual Studio Code.

本外掛是 VSCode 上處理 Unicode 與 CJK 編碼最方便的工具。

このプラグインは VSCode でユニコードや CJK 文字コードを扱うのに一番便利なツールです。

# Functions | 功能 | 機能

## Show Unicode value | 顯示字元 Unicode 值 | 文字コード表示

This extension shows Unicode value for the current character of keyboard cursor in the status bar.

隨時將目前游標處字元的 Unicode 值顯示在狀態列上。

現在カーソル位置の文字の Unicode の文字コードがステータスバーに表示されます。

![image](https://user-images.githubusercontent.com/5418570/82236077-2c780b00-9966-11ea-83c4-e335b0e92141.png)

If the character comes with combining marks, variation selectors or zero-width-joiner (e.g. emojis), the whole sequence will be shown.

當字元後方有組合字元、異體字選擇子、連接字元（如繪文字等）時，能夠顯示出完整序列。

文字の後ろに結合文字・異体字セレクタまたはジョイナー（複雑な絵文字など）がついている場合、まとめて表示されます。

![image](https://user-images.githubusercontent.com/5418570/82236168-4d406080-9966-11ea-9a5a-7b2265a7d702.png)

## Encoding forms | 各種編碼方式 | 符号化方式

When you click the Unicode value in the status bar, many kinds of encoding forms will be shown.
Such as UTF-8, UTF-16 (Surrogate Pairs), entity refernce of HTML and URL encode.

點選狀態列上的 Unicode 值，能夠顯示出此字元的各種編碼方式。像是 UTF-8、UTF-16（代理組）與 HTML 實體參照等，不用再自己計算了。

ステータスバーに表示される Unicode 値をクリックすると、様々な符号化方式が表示されます。UTF-8、UTF-16サロゲートペア、HTML 実体参照などの複雑な計算はもうしなくて済みます。

![image](https://user-images.githubusercontent.com/5418570/82236450-b1632480-9966-11ea-9747-4341cd08bf98.png)

If the character is contained in CJK encodings or Adobe ROS, the ANSI code or CID code will also be shown.
Big5, Big5-HKSCS, Big-UAO, Shift-JIS, GBK and KS are supported.

若此字元包含於各種 CJK 編碼或 Adobe ROS，也會一並顯示出字碼或 CID 值。
支援 Big5、Big5 香港增補字符集、Big5-UAO (Unicode補完計畫)、Shift-JIS、GBK 與 KS 等。

CJK 文字の固有符号化方式の文字コードと Adobe ROS の CID コードにも対応。Windows と Mac の違いや、JIS83 と JIS2004 の違いも対応。

![image](https://user-images.githubusercontent.com/5418570/82473452-287df180-9afc-11ea-8d62-f9f659768068.png)

We also support the glyph Nice Names of [Glyphs](https://glyphsapp.com/)!

並支援 [Glyphs](https://glyphsapp.com/) 的預設字符名稱。

[Glyphs](https://glyphsapp.com/) のグリフのナイスネームも表示可能！


You can select any line to copy it, and paste to your source code!

您可選取任何一行將字串複製到剪貼簿，貼到程式碼或應用程式裡使用。

表示される文字列を選択し、クリップボードにコピーされます。自由にソースコードなどに貼り付けてご利用ください。

## Reverse pattern | 反解也可以 | 逆パターン

We can know the Unicode (and many other encodings) of character now.
However, can we know what the code is if we have a Unicode value?

Don't worry. You can just move the mouse cursor over the Unicode value. And the character information will be popuped. Easy and simple!

有時候反而是會在程式碼裡碰到已經編碼過的 Unicode 值，但看不出來是什麼字元，要換算也很麻煩。
不過沒關係，本工具讓您只要將滑鼠游標移到上面，就直接會顯示出這是什麼字元。簡單吧！

逆パターンもOK。ソースコードなどですでにエンコードされた文字コードを目にすることがあります。なんの文字かわかりにくい場合も多いはず（特にUTF-8・サロゲートなどは計算しにくい）。
大丈夫！マウスカーソルを指すだけで、文字情報が表示されます。

![image](https://user-images.githubusercontent.com/5418570/82473760-a2ae7600-9afc-11ea-852d-bb86396939b6.png)

## Unicode character input helper | 輸入幫手 | 入力ヘルパー

Just press Ctrl + 🄸 (or Cmd⌘ + 🄸 in Mac), unicode name list will be shown.
You can input some keyword to query the character which you want to input.

按 Ctrl + 🄸 (或 Cmd⌘ + 🄸)，會顯示出所有 Unicode 字元名稱。
在這裡可以輸入一些簡單的關鍵字，輔助輸入不容易輸入的字元。

Ctrl + 🄸 (または Cmd⌘ + 🄸) を押すと、全ての文字の Unicode 名などが表示される。
簡単なキーワードで入力したい文字を探し出して入力してください。

![image](https://user-images.githubusercontent.com/5418570/82473976-eacd9880-9afc-11ea-9262-080cc2b3276b.png)

![image](https://user-images.githubusercontent.com/5418570/82474277-662f4a00-9afd-11ea-876e-40dad6c83cc9.png)

This is very helpful to input special symbols, emojis, and foreign language letters which you don't have their IMEs.

本功能適合用來輸入特殊符號、繪文字，甚至可以作為簡易的輸入法輸入外文字母。

この機能は記号・絵文字の入力に活躍します。また、IMEのインストールが面倒な場合、外国語の文字の入力にも使えます。


Hint / 使用例提示 / 入力ヒント ：

- ¢ : cent
- ฿ : baht
- 한 : han
- ห : hoh
- 😍 : smil
- 🕒 : threeoc
- 🀄 : red
- … : ...
- 🈲 : 禁

# To be done

- to implement complete [Grapheme Cluster Boundaries](http://www.unicode.org/reports/tr29/#Grapheme_Cluster_Boundaries) (UAX#29) to support more language such as Arabic, Indian, ...
- to support variation selectors of Adobe ROSs.
- ...
