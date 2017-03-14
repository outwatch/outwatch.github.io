
<div class="example-hello-world-setup">
{% include switch-tab-widget.html %}
<div class="lang-specific scala">
{% highlight text %}
$ sbt new outwatch/seed.g8
{% endhighlight %}
</div>
<div class="lang-specific purescript">
{% highlight text %}
$ bower install purescript-outwatch
{% endhighlight %}
</div>
</div>
<div class="example-hello-world-code">
<div class="lang-specific scala">
{% highlight scala %}
import scala.scalajs.js.JSApp
import outwatch.dom._

object HelloWorld extends JSApp {
  def main() = {
    val names = createStringHandler()

    val node = div(
      input(placeholder := "Name", inputString --> names),
      hr(),
      h2("Hello ", child <-- names)
    )

    OutWatch.render("#app", node)
  }
}
{% endhighlight %}
</div>
<div class="lang-specific purescript">
{% highlight haskell %}
module Main where

import OutWatch
import OutWatch.Core (render) as OutWatch

main =
  let names = createStringHandler[]

      node = div
        [ input[placeholder := "Name", inputString ==> names]
        , hr[]
        , h2[text "Hello ", childShow <== names.src]
        ]

  in OutWatch.render "#app" node

{% endhighlight %}
</div>
</div>
<div class="example-hello-world-container">
  <div id="app" ></div>
</div>
