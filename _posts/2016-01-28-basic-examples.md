---
title:  "Basic examples"
tags: chapters
---


For our first example program, we're going to build a small component that will display the seconds elapsed since the application started. With this program we want to demonstrate how to bind Observables to the DOM.

Let's take a look:
{% include switch-tab-widget.html %}

<div class="lang-specific scala">
{% highlight scala %}
val seconds = Observable.interval(1000)
      .map(_ + 1)
      .startWith(0)

val root = div("Seconds elapsed: ", child <-- seconds)

OutWatch.render("#app", root)
{% endhighlight %}
</div>

<div class="lang-specific purescript">
{% highlight haskell %}
let seconds = Observable.interval 1000
      # map (_ + 1)
      # startWith 0
    root = div [text "Seconds elapsed: ", childShow <== seconds]

in OutWatch.render "#app" root
{% endhighlight %}
</div>

<div class="lang-specific scala" markdown="1">
It's important to note here, that `Observable.interval(1000)` will return an Observable that emits numbers starting with 0 after every 1000 ms. So we use `map` to tell the Observable to add 1 to each emission and to startWith 0, before the first 1000ms elapse.

OutWatch uses a domain specific language to construct virtual dom elements, `div()`, `span()` and all the standard HTML tags can be used this way. It's very similar to `ScalaTags`, you can read more <a onclick="window.location='/dom'+window.location.search;">here</a>.

The actual API comes from the left facing arrow `<--`. It's one of the two main operators in OutWatch.
What it does is, listen to the Observable you pass and updates the DOM accordingly.
This works with children, like with the `child` attribute, but also with any HTML Attributes.

</div>
<div class="lang-specific purescript" markdown="1">
It's important to note here, that `Observable.interval 1000 ` will return an Observable that emits numbers starting with 0 after every 1000 ms. So we use `map` to tell the Observable to add 1 to each emission and to startWith 0, before the first 1000ms elapse.

OutWatch uses a domain specific language to construct virtual dom elements, `div[]`, `span[]` and all the standard HTML tags can be used this way. It's very similar to `purescript-pux or Elm`, if you know either. You can read more <a onclick="window.location='/dom'+window.location.search;">here</a>.

The actual API comes from the left facing arrow `<==`. It's one of the two main operators in OutWatch.
What it does is, listen to the Observable you pass and updates the DOM accordingly.
This works with children, like with the `childShow` attribute, which requires an `Observable` of anything that implements the `Show` typeclass, but also with any HTML Attributes.

</div>

To demonstrate we're going to take a look at another example, where we'll create a checkbox,
which will hide a view if checked. This will also demonstrate how to get an Observable from a DOM Event.

{% include switch-tab-widget.html %}
<div class="lang-specific scala">
{% highlight scala %}
val toggleEvents = createInputHandler()

val root = div(
  label("Hide view"),
  input(tpe := "checkbox", change --> toggleEvents),
  h2(hidden <-- toggleEvents.map(_.target.checked), "Visible!")
)

OutWatch.render("#app", root)
{% endhighlight %}
</div>
<div class="lang-specific purescript">
{% highlight haskell %}
let root = do
  toggleEvents <- createInputHandler[]

  div
    [ label [text "Hide view"]
    , input [tpe := "checkbox", change ==> toggleEvents]
    , h2 [hidden <== (toggleEvents.src # map (\e -> unsafePerformEff $ checked $ unsafeCoerce $ target $ unsafeCoerce e)), text "Visible!"]
    ]
in OutWatch.render "#app" root
{% endhighlight %}
</div>

There's quite a few things to digest here, so let's start from the top .

<div class="lang-specific purescript" markdown="1">
First up, there's `createInputHandler`, it creates a Record that has both an `Observable` and also a `Sink`.
We'll take a look at `Sink`s in more detail later,
but the next thing to note here is the right facing arrow `==>`,
which pipes all the `change` events of our checkbox into the `toggleEvents` Observable.
</div>
<div class="lang-specific scala" markdown="1">
First up, there's `createInputHandler`, it creates an `Observable` that is also a `Sink`.
We'll take a look at `Sink`s in more detail later,
but the next thing to note here is the right facing arrow `-->`,
which pipes all the `change` events of our checkbox into the `toggleEvents` Observable.
</div>
Then we can use it, map it to the `checked` value of the checkbox and pipe it into the `hidden` attribute of our `h2`.

<div class="lang-specific purescript" markdown="1">
Now before you leave in disgust this is not how our code is going to look later on.
</div>
The problem with code like this, is that we don't really want to deal with the internals of the DOM.
Instead of mapping an event to it's target and then it's `checked` value,
we should be able to query for `checked` values, i.e. simple `Boolean` values.
Most of the time we simply do not care about any `InputEvent` at all.

Luckily OutWatch has us covered, instead of using `change` which binds to a `Sink` of `InputEvent`,
 we can use `inputChecked` which binds directly to a `Sink` of `Boolean`, making the resulting code much more concise.
Let's check it out!

{% include switch-tab-widget.html %}
<div class="lang-specific scala">
{% highlight diff %}
- val toggleEvents = createInputHandler()
+ val toggleEvents = createBoolHandler()


val root = div(
  label("Hide view"),
- input(tpe := "checkbox", change --> toggleEvents),
- h2(hidden <-- toggleEvents.map(_.target.checked), "Visible!")
+ input(tpe := "checkbox", inputChecked ==> toggleEvents)
+ h2(hidden <-- toggleEvents, "Visible!")
)

OutWatch.render("#app", root)
{% endhighlight %}
</div>
<div class="lang-specific purescript">
{% highlight diff %}
let root = do
-   toggleEvents <- createInputHandler[]
+   toggleEvents <- createBoolHandler[]

    div
      [ label [text "Hide view"]
-     , input [tpe := "checkbox", change ==> toggleEvents]
-     , h2 [hidden <== (toggleEvents.src # map (\e -> unsafePerformEff $ ...
+     , input [tpe := "checkbox", inputChecked ==> toggleEvents]
+     , h2 [hidden <== toggleEvents.src, text "Visible!"]
      ]
in OutWatch.render "#app" root
{% endhighlight %}
</div>

That looks much better already, doesn't it?
Notice how we had to change our `toggleEvents` to reflect the change we made, since it now only accepts `Boolean`s.

Pretty simple so far, right? Now let's take a closer look at the `createInputHandler` function.

<span class="lang-specific purescript" markdown="1">
The function returns a Record that has an `Observable` called `src` and also a `Sink` called `sink`.
It functions as both a Source and Sink of events.
</span>
<span class="lang-specific scala" markdown="1">
The function returns `Observable with Sink`, which is an Observable that can also receive Events,
i.e. it's both a Source and a Sink of events.
</span>
If you're familiar with Rx,
they're very similar to Subjects.
If we inject such these into a component, we can "forward" the events generated in the component,
so `toggleEvents` emits an event every time our checkbox is changed.

Now the last thing to note is that we write `tpe` instead of `type`, because `type` is a keyword.
We could've also written `inputType`<span class="lang-specific scala" markdown="1"> or `type` in backticks</span>.
For more on differences between HTML and the DOM DSL check <a onclick="window.location='/dom'+window.location.search;">here</a>.

Our next example is going to be a very simple example with two input fields, for first and last name.
We then want to combine those two fields into full name that will update when either field changes.
In order to do that, we're going to make use of the `combineLatest` operator:

{% include switch-tab-widget.html %}
<div class="lang-specific scala">
{% highlight scala %}
val firstNameEvents = createStringHandler()
val lastNameEvents = createStringHandler()

val firstNames = firstNameEvents.startWith("")
val lastNames = lastNameEvents.startWith("")

val fullNames = firstNames
      .combineLatestWith(lastNames)((first, last) => s"$first $last")

val root = div(
  input(inputString --> firstNameEvents),
  input(inputString --> lastNameEvents),
  h3("Hello, ", child <-- fullNames)
)

OutWatch.render("#app", root)
{% endhighlight %}
</div>
<div class="lang-specific purescript">
{% highlight haskell %}
let root = do
  firstNameEvents <- createStringHandler[]
  lastNameEvents <- createStringHandler[]

  let firstNames = firstNameEvents.src # startWith ""
  let lastNames = lastNameEvents.src # startWith ""

  let fullNames = combineLatest(\first last -> first <> " " <> last)
        firstNames lastNames


  div
    [ input [inputString ==> firstNameEvents]
    , input [inputString ==> lastNameEvents]
    , h3 [text "Hello, ", childShow <== fullNames]
    ]
in OutWatch.render "#app" root
{% endhighlight %}
</div>
`combineLatest` takes another Observable and emits an element, whenever one of the original Observables emit.
Here's a diagram to visualize exactly that:

![CombineDiagram]({{ site.url }}/img/CombineMarbles.png)

What else can we see from this excerpt? We can see, that analogous to `inputChecked`,
 there's also `inputString` (we'll see later that there's also `inputNumber`),
 which emits the value of the textfield, so we don't have to map events to them manually.

So now we've seen the <span class="lang-specific scala" markdown="1">`child`</span>
<span class="lang-specific purescript" markdown="1">`childShow`attribute in action multiple times,
 but what if we want multiple children?
Instead of an Observable of a single element, we would need an Observable of a Sequence.
And that's exactly what we can do with the `children` attribute.

Here's a quick example:
{% include switch-tab-widget.html %}
<div class="lang-specific scala">
{% highlight scala %}
val list = List("What", "Is", "Up?").map(s => li(s))
val lists = Observable.just(list)
val root = ul(children <-- lists)
{% endhighlight %}
</div>
<div class="lang-specific purescript">
{% highlight scala %}
let list = ["What", "Is", "Up?"] # map (\s -> li [text s])
    lists = Observable.just list
    root = ul[children <== lists]
{% endhighlight %}
</div>
This makes it pretty easy to build dynamic lists, which are very common in a lot of applications.
Let's see how we can use this to build a small application.

We're gonna build a slider, whose value will determine the size of a dynamic list of images.
Sounds awfully useful, doesn't it?

Nevertheless we're gonna try and tackle this.
We're gonna map each emited value to a List and fill it with `n` `img` elements.
Also to make it easy, we divide every value by `10`,
because by default HTML Range sliders will go from `0` to `100`.
We're also going to use the aforementioned `inputNumber` instead of getting the value out our input element by hand:

{% include switch-tab-widget.html %}
<div class="lang-specific scala">
{% highlight scala %}
val sliderEvents = createNumberHandler()

val imageLists = sliderEvents
  .map(_ / 10.0)
  .map(n => List.fill(n)(img(src := imageUrl)))

val root = div(
  input(
    tpe := "range",
    inputNumber --> sliderEvents,
    value := 0
  ),
  div(children <-- imageLists)
)

OutWatch.render("#app", root)
{% endhighlight %}
</div>
<div class="lang-specific purescript">
{% highlight haskell %}
let root = do
  sliderEvents = createNumberHandler[]

  let imageLists = sliderEvents.src
    # map (_ / 10.0)
    # map round
    # map (\n -> replicate n (img[src := imageUrl]))

  ul
    [ input
      [ tpe := "range"
      , inputNumber ==> sliderEvents
      , valueShow := 0
      ]
    , div [children <== imageLists]
    ]
in OutWatch.render "#app" root
{% endhighlight %}
</div>

Right now you might be wondering what goes between those brackets of the various `createHandler` functions.
The answer is surprisingly easy.
One of the most common use cases we've found, was creating a Handler and then using `startWith` to create a default value.
Exactly because it is so common we've come up with a way to make this common implementation more concise.
Instead of calling `startWith` manually you can just put one or more default values into the createHandler function.
We can refactor out simple name app like this:

{% include switch-tab-widget.html %}
<div class="lang-specific scala">
{% highlight scala %}
val firstNames = createStringHandler("")
val lastNames = createStringHandler("")

val fullNames = firstNames
  .combineLatestWith(lastNames)((first, last) => s"$first $last")

val root = div(
  input(inputString --> firstNames),
  input(inputString --> lastNames),
  h3("Hello, ", child <-- fullNames)
)

OutWatch.render("#app", root)
{% endhighlight %}
</div>
<div class="lang-specific purescript">
{% highlight haskell %}
let root = do
  firstNames <- createStringHandler[""]
  lastNames <- createStringHandler[""]

  let fullNames = combineLatest(\first last -> first <> " " <> last)
        firstNames.src lastNames.src

  div
    [ input [inputString ==> firstNames]
    , input [inputString ==> lastNames]
    , h3 [text "Hello, ", childShow <== fullNames]
    ]
in OutWatch.render "#app" root
{% endhighlight %}
</div>

This allows us some great flexibility and improves the perceived readability in a lot of common use cases.
You've now learned all the basics of OutWatch!

In our <a onclick="window.location='/components'+window.location.search;">next chapter</a>, we're going to be looking at how we can encapsulate our code into small reusable components.


{% include switch-tab-sources.html %}


---
