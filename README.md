# Here Unicode Checker
This extension is the best tool helps you work with Unicode and Eastern Asian encodings in VSCode.

# Functions 

## Unicode of Current character

This extension shows Unicode value for the current character of keyboard cursor in the status bar.

![image](https://user-images.githubusercontent.com/5418570/82236077-2c780b00-9966-11ea-83c4-e335b0e92141.png)

If the character comes with combining marks, variation selectors or zero-width-joiner (e.g. emojis), the whole sequence will be shown.

![image](https://user-images.githubusercontent.com/5418570/82236168-4d406080-9966-11ea-9a5a-7b2265a7d702.png)

## Encoding forms

When you click the Unicode value in the status bar, many kinds of encoding forms will be shown.
Such as UTF-8, UTF-16 (Surrogate Pairs), entity refernce of HTML and URL encode.

![image](https://user-images.githubusercontent.com/5418570/82236450-b1632480-9966-11ea-9747-4341cd08bf98.png)

If the character is contained in CJK encodings or Adobe ROS, the ANSI code or CID code will also be shown.

We also support the glyph Nice Names of [Glyphs](https://glyphsapp.com/)!

![image](https://user-images.githubusercontent.com/5418570/82236638-f5562980-9966-11ea-9b75-83bc784fae13.png)

You can select any line to copy it.

## Unicode to Character info

We can know the Unicode (and many other encodings) of character now.
However, can we know what the code is if we have a Unicode value?

Don't worry. You can just move the mouse cursor over the Unicode value. And the character information will be popuped. Easy and simple!

![image](https://user-images.githubusercontent.com/5418570/82236778-33534d80-9967-11ea-9ae2-75c27e3d97f3.png)

UTF-8, UTF-16 and entity references are supported now.

# To be done

- to implement complete [Grapheme Cluster Boundaries](http://www.unicode.org/reports/tr29/#Grapheme_Cluster_Boundaries) (UAX#29) to support more language such as Arabic, Indian, ...
- to support variation selectors of Adobe ROSs.
- ...
