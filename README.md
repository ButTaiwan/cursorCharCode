# Here Unicode Mate
This extension is the best tool helps you work with Unicode and CJK encodings in Visual Studio Code.

# Functions 

## Unicode value of current character

This extension shows Unicode value for the current character of keyboard cursor in the status bar.

![image](https://user-images.githubusercontent.com/5418570/82236077-2c780b00-9966-11ea-83c4-e335b0e92141.png)

If the character comes with combining marks, variation selectors or zero-width-joiner (e.g. emojis), the whole sequence will be shown.

![image](https://user-images.githubusercontent.com/5418570/82236168-4d406080-9966-11ea-9a5a-7b2265a7d702.png)

## Encoding forms

When you click the Unicode value in the status bar, many kinds of encoding forms will be shown.
Such as UTF-8, UTF-16 (Surrogate Pairs), entity refernce of HTML and URL encode.

![image](https://user-images.githubusercontent.com/5418570/82236450-b1632480-9966-11ea-9747-4341cd08bf98.png)

If the character is contained in CJK encodings or Adobe ROS, the ANSI code or CID code will also be shown.
Big5, Big5-HKSCS, Big-UAO, Shift-JIS, GBK and KS are supported.

We also support the glyph Nice Names of [Glyphs](https://glyphsapp.com/)!

![image](https://user-images.githubusercontent.com/5418570/82473452-287df180-9afc-11ea-8d62-f9f659768068.png)

![image](https://user-images.githubusercontent.com/5418570/82474277-662f4a00-9afd-11ea-876e-40dad6c83cc9.png)


You can select any line to copy it, and paste to your source code!

## Unicode to character info

We can know the Unicode (and many other encodings) of character now.
However, can we know what the code is if we have a Unicode value?

Don't worry. You can just move the mouse cursor over the Unicode value. And the character information will be popuped. Easy and simple!

![image](https://user-images.githubusercontent.com/5418570/82473760-a2ae7600-9afc-11ea-852d-bb86396939b6.png)

UTF-8, UTF-16 and entity references are supported now.

## Unicode character input helper

Just press Ctrl + I (or Cmd + I in Mac), unicode name list will be shown.
You can input some keyword to query the character which you want to input.

![image](https://user-images.githubusercontent.com/5418570/82473976-eacd9880-9afc-11ea-9262-080cc2b3276b.png)

This is very helpful to input special symbols and emojis.

# To be done

- to implement complete [Grapheme Cluster Boundaries](http://www.unicode.org/reports/tr29/#Grapheme_Cluster_Boundaries) (UAX#29) to support more language such as Arabic, Indian, ...
- to support variation selectors of Adobe ROSs.
- ...
