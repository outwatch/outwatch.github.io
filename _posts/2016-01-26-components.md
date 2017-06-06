---
title: "Components"
tags: chapters
---


Components are cool, because they let you split your app into independent, reusable modules and let you work on each component in isolation.

A component in OutWatch is just a simple function, that returns virtual elements.
Components can take three fundamentally different types of parameters.
We're going to explain each one by one.

### Properties

Properties are values that can be passed to a component function to parameterize them.
They are the most simple thing you could pass to a component and that makes them well suited for more presentational components.
For as long as this component stays alive, these properties won't ever change.

Let's look at our first example of an OutWatch component, a simple header component.

{% include switch-tab-widget.html %}
<div class="lang-specific scala">
{% highlight scala %}
def headerComponent(title: String, hideSecond: Boolean) = {
  div(
    h1(title),
    h2(hidden := hideSecond, "This is the second title")
  )
}
{% endhighlight %}
</div>
<div class="lang-specific purescript">
{% highlight haskell %}
headerComponent :: forall e. String -> Boolean -> VDom e
headerComponent title hideSecond =
  div
    [ h1[text title]
    , h2[hidden := hideSecond, text "This is the second title"]
    ]
{% endhighlight %}
</div>

So our `headerComponent` function takes a `String` and a `Boolean` as parameters and returns a Virtual DOM tree.
In our `main`-function we can now call this function and pass it to `OutWatch.render`.

<div class="lang-specific scala">
{% highlight scala %}
OutWatch.render("#app", headerComponent("Our Title", false))
{% endhighlight %}
</div>

<div class="lang-specific purescript">
{% highlight haskell %}
OutWatch.render "#app" (headerComponent "Our Title" false)
{% endhighlight %}
</div>
Good job! We've created our first component!
We can create these components anywhere where we'd otherwise use DOM DSL.


<span class="lang-specific scala" markdown="1">
The return type of such a component is `VNode` and it's the same that's returned by any other OutWatch DOM function,
 i.e. `h3()` or `div()`.
</span>
<span class="lang-specific purescript" markdown="1">
The return type of such a component is `VDom e`,
 where `e` is an effect type. `VDom e` is the same that's returned by any other OutWatch DOM function,
 i.e. `h3[]` or `div[]`.
The effect type is determined by what happens inside a component.
</span>

<span class="lang-specific purescript" markdown="1">
For example, if you create a component that writes to the console,
 the component will be of type `VDom (console :: CONSOLE)`.
We'll see later how we can do such a thing, but for now it's good to know what the `e` means for a component.
</span>

<blockquote markdown="1">
### Components are only functions

Since components are just functions, we can use all the cool stuff associated with them
,<span class="lang-specific scala" markdown="1"> namely currying, partial application and default parameters.</span>
<span class="lang-specific purescript" markdown="1"> namely currying and partial application.</span>
For example we could create a partially applied function that only takes a Boolean as a parameter out of our `headerComponent` function as easily as this:
<div class="lang-specific scala">
{% highlight scala %}
val introComponent = headerComponent("Intro", _: Boolean)
{% endhighlight %}
</div>
<div class="lang-specific purescript">
{% highlight haskell %}
let introComponent = headerComponent "Intro"
{% endhighlight %}
</div>
<div class="lang-specific scala">
Likewise we could create default parameters by simply changing the function signature to this:
{% highlight scala %}
headerComponent(title: String, hideSecond: Boolean = false)
{% endhighlight %}
</div>
This allows us a lot of flexibility and really enables us to easily reuse all our components.
</blockquote>


Next we're going to look at a component that takes an `Observable` as a parameter.

### Input streams

When we pass an Observable into a component, it usually means the component is going to change whenever the Observable emits an element.
Of course, in practice we could do whatever we want with the stream, but unlike a component with just properties, these components usually feature some form of interactivity.
These types of components aren't usually used very often, but it's worth mentioning for the sake of completeness.

Here's an example for one such component:
{% include switch-tab-widget.html %}
<div class="lang-specific scala">
{% highlight scala %}
def nameListComponent(nameLists: Observable[List[VNode]]): VNode = {
  div(
    span(children <-- nameLists)
  )
}
{% endhighlight %}
</div>
<div class="lang-specific purescript">
{% highlight haskell %}
nameListComponent :: forall e. Observable(List(VDom e)) -> VDom e
nameListComponent nameLists =
  div[ span(children <== nameLists) ]
{% endhighlight %}
</div>

These components are very useful to break up larger components with a lot of styling into smaller ones. In other scenarios, it might be easier to use stateless components, components with only properties, and recreate them, when one of their values changes. We're going to look at this kind of technique later.

The next parameter we're going to look at are output streams.

### Output streams
Often times components will have some sort of events, you would like to pass to its parent component.
The easiest way to do this, is to specify a `Sink` as a parameter of the component.
That way, you can extract an `Observable` from a child component.
Here's an example of a very simple component:
{% include switch-tab-widget.html %}
<div class="lang-specific scala">
{% highlight scala %}
def inputComponent(labelText: String, textValues: Sink[String]) = {
  div(
    label(labelText),
    input(inputString --> textValues)
  )
}
{% endhighlight %}
</div>
<div class="lang-specific purescript">
{% highlight haskell %}
inputComponent:: forall e. String -> SinkLike e String _ -> VDom e
inputComponent labelText textValues =
  div
    [ label[ text labelText]
    , input[ inputString ==> textValues]
    ]
{% endhighlight %}
</div>
<blockquote class="lang-specific purescript" markdown="1">
`SinkLike` here is an `Extensible Record`,
 which for us basically only means that we can pass either a `Handler` or a `Sink` to our `inputComponent` function.
In case you're unfamiliar,
 the underscore here represents the subset of the fields that aren't required for this function to work.
</blockquote>

This component delegates the `String`s emited by the textfield to the parent component.
In the parent component, we would instantiate such a component like this:

{% include switch-tab-widget.html %}
<div class="lang-specific scala">
{% highlight scala %}
def main() = {
  val names = createStringHandler()

  val root = div(
    inputComponent("Name", names),
    h2("Hello ", child <-- names)
  )

  OutWatch.render("#app", root)
}
{% endhighlight %}
</div>
<div class="lang-specific purescript">
{% highlight haskell %}
main =
  let names = createStringHandler[]

      root = div
        [ inputComponent[text "Name", names]
        , h2[text "Hello ", childShow <== names]
        ]

  in OutWatch.render "#app" root
{% endhighlight %}
</div>

We pass a `Sink` of type `String` to our component and it will forward the events to our `names`-Observable.
Then we can take that Observable and bind it to the child of our `h2` element.

The cool thing about this, is that by the look of the function you can immediately see what it's inputs and outputs are.
That means you can easily swap out components with the same function signature.

For example, let's say, instead of a textfield, we'd like a button, that (for whatever reason) always emits the text in the label. We'd just need to replace the call to `inputComponent` with another function with the same signature.
Our `inputComponent` has the signature <span class="lang-specific scala" markdown="1">`(String, Sink[String]) => VNode`</span><span class="lang-specific purescript" markdown="1">`String -> SinkLike e String _ -> VDom e`</span> , so our new component should have the same.

{% include switch-tab-widget.html %}
<div class="lang-specific scala">
{% highlight scala %}
def buttonComponent(labelText: String, textValues: Sink[String]) = {
  div(
    label(labelText),
    button(click(labelText) --> textValues)
  )
}
{% endhighlight %}
</div>
<div class="lang-specific purescript">
{% highlight haskell %}
buttonComponent::forall e. String -> SinkLike e String _ -> VDom e
buttonComponent labelText textValues =
  div
    [ label[text labelText]
    , button[ mapE click (const labelText) ==> textValues]
    ]
{% endhighlight %}
</div>

This isn't a very useful component, but it demonstrates two things.
First, how easy it is to replace components, if they have the same signature and second,
<span class="lang-specific scala" markdown="1"> that we can take any DOM event, and write a value after it in parentheses to transform each emission to the value in the brackets.</span>
<span class="lang-specific purescript" markdown="1"> that we can take any DOM event and preemptively map each of it's emissions using `mapE`. In our case we always just want to emit the `labelText` so `(const labelText)` turns each `MouseEvent` into the `labelText` and emits that into our `textValues` Sink.</span>

This is roughly equivalent to calling the `mapTo` operator on the resulting `Observable` and allows us to declare emissions in a more concise way.
In most of our use cases, we don't really care about the `MouseEvent`, that the `click` event emits.

<div class="lang-specific scala" markdown="1">
We could also provide a function that takes a `MouseEvent` and returns something else akin to the `map` operator of `Observable`.

Another thing we can do in the same way, is override a DOM event with the latest emission of an `Observable`, by passing it in parantheses.
</div>

<div class="lang-specific purescript" markdown="1">
Another thing we can do in the same way, is override a DOM event with the latest emission of an `Observable`, by using the `override` function.
</div>

Let's look at a quick example, by replacing our `inputComponent`, with another component, this time, with a component, that has two textfields for first and last names and a button to submit the names to the parent component:

{% include switch-tab-widget.html %}
<div class="lang-specific scala">
{% highlight scala %}
def personComponent(labelText: String, texts: Sink[String]) = {
  val firstNames = createStringHandler("")
  val lastNames = createStringHandler("")

  val fullNames = firstNames
    .combineLatestWith(lastNames)((first, last) => s"$first $last")

  div(
    label(labelText),
    input(inputString --> firstNames),
    input(inputString --> lastNames),
    button(click (fullNames) --> texts, "Submit")
  )
}
{% endhighlight %}
</div>
<div class="lang-specific purescript">
{% highlight haskell %}
personComponent :: forall e. String -> SinkLike e String _ -> VDom e
personComponent labelText textValues =
  let firstNames = createHandler [""]
      lastNames = createHandler [""]

      fullNames = combineLatest (\first last -> first <> " " <> last)
        firstNames.src lastNames.src

  in div
    [ label [text labelText]
    , input [inputString ==> firstNames]
    , input [inputString ==> lastNames]
    , button
      [ override click fullNames ==> textValues
      , text "Submit"
      ]
    ]
{% endhighlight %}
</div>
In this example, we use two streams and two textfields internally, but since the signature is still the same, swapping it out for our original component doesn't require any changes in our parent component.

Since the component is so decoupled, we can work on it separately. For example, we'd like to disable the submit button if the full name is less than 4 characters long. To do that we need an `Observable`, that emits a Boolean value everytime the full name is changed and checks if the name is long enough.
Here's a pretty easy way to go about it:

{% include switch-tab-widget.html %}
<div class="lang-specific scala">
{% highlight diff %}
def personComponent(labelText: String, texts: Sink[String]) = {
   // ...
   val fullNames = firstNames
     .combineLatestWith(lastNames)((first, last) => s"$first $last")

+  val disableEvents = fullNames.map(_.length < 4)

  div(
    label(labelText),
    input(inputString --> firstNames),
    input(inputString --> lastNames),
-   button(click(fullNames) --> texts, "Submit")
+   button(
+     click(fullNames) --> texts,
+     disabled <-- disableEvents,
+     "Submit"
+   )
  )
}
 
{% endhighlight %}
</div>
<div class="lang-specific purescript">
{% highlight diff %}
personComponent :: forall e. String -> SinkLike e String _ -> VDom e
personComponent labelText textValues =
  let firstNames = createStringHandler[""]
      lastNames = createStringHandler[""]

      fullNames = combineLatest (\first last -> first <> " " <> last)
        firstNames.src lastNames.src

+     disableEvents = fullNames # map (\s -> length s < 4)

  in div
    [ label [text labelText]
    , input [inputString ==> firstNames]
    , input [inputString ==> lastNames]
    , button
      [ override click fullNames ==> textValues
+     , disabled <== disableEvents
      , text "Submit"
      ]
    ]
{% endhighlight %}
</div>
___

Our component still isn't perfect, so we're going to do one last thing.
Right now if you've followed this guide so far, you've probably noticed, that when we run the application above, that every time we click the submit button, our textfields don't get cleared.

So let's go and add some functionality for that.
Since we want the textfields to clear everytime we press the submit button, we're going to need an `Observable`, that emits an empty string `""` everytime we press on it.
There are different ways to do it, but for now, here's a pretty simple solution, that works with what we've learned so far.

{% include switch-tab-widget.html %}
<div class="lang-specific scala">
{% highlight diff %}
def personComponent(labelText: String, texts: Sink[String]) = {
   // ...

+ val clearEvents = createStringHandler()

  div(
    label(labelText),
-   input(inputString --> firstNames),
-   input(inputString --> lastNames),
-   button(click(fullNames) --> texts, disabled <-- disableEvents, "Submit")
+   input(inputString --> firstNames, value <-- clearEvents),
+   input(inputString --> lastNames, value <-- clearEvents),
+   button(
+     click(fullNames) --> confirmedTexts,
+     click("") --> clearEvents,
+     disabled <-- disableEvents,
+     "Submit"
+   )
  )
}
{% endhighlight %}
</div>
<div class="lang-specific purescript">
{% highlight diff %}

      ...

+     clearEvents = createStringHandler[]

  in div
    [ label [text labelText]
-   , input [inputString ==> firstNames]
-   , input [inputString ==> lastNames]
+   , input [inputString ==> firstNames, value <== clearEvents.src]
+   , input [inputString ==> lastNames, value <== clearEvents.src]
    , button
      [ override click fullNames ==> textValues
+     , mapE click (const "") ==> clearEvents
      , disabled <== disableEvents
      , text "Submit"
      ]
    ]
{% endhighlight %}
</div>
And with that, we conclude this chapter.

We learned about how components help us structure our code into small reusable modules. We also learned about the different types of parameters passed into functions and how we can transform event streams declaratively.
In the next <a onclick="window.location='/managing-state'+window.location.search;">chapter</a>, we're going to talk about how to manage state effectively.

{% include switch-tab-sources.html %}
