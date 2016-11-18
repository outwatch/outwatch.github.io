
<div class="example-hello-world-code">
{% highlight scala %}
import scala.scalajs.js.JSApp
import outwatch.dom._

object HelloWorld extends JSApp {
  def main() = {
    val names = createInputHandler()
    
    val node = div(
      input(tpe := "text", placeholder := "Name", input --> names),
      hr(),
      h2("Hello ", child <-- names.map(_.target.value))
    )

    OutWatch.render("#app", node)
  }
}
{% endhighlight %}
</div>
<div class="example-hello-world-container">
  <div id="app" ></div>
</div>

