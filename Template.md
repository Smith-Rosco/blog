# Template

## 引导标注

| 样式                 | 风格     |
| :------------------- | -------- |
| default              | simple   |
| success              | modern   |
| info                 | flat     |
| warning              | disabled |
| danger               | no-icon  |
| icon(fab fa-cc-visa) |          |

``` markdown
{% note default simple %}

{% endnote %}

```

## 分栏tab

{% tabs name %}

<!-- tab name_1 @icon -->

text

<!-- endtab -->



<!-- tab name_1=2 @icon -->

text

<!-- endtab -->

{% end tabs %}

