---
title:  "Basic examples"
tags: chapters
---

For our first example program, we're going to build a small component that will display the seconds elapsed since the application started. With this program we want to demonstrate how to bind Observables to the DOM.

Let's take a look:

{% highlight scala %}
val seconds = Observable.interval(1000)
      .map(_ + 1)
      .startWith(0)

val root = div("Seconds elapsed: ", child <-- seconds)

OutWatch.render("#app", root)
{% endhighlight %}

It's important to note here, that `Observable.interval(1000)` will return an Observable that emits numbers starting with 0 after every 1000 ms. So we use `map` to tell the Observable to add 1 to each emission and to startWith 0, before the first 1000ms elapse.

OutWatch uses a domain specific language to construct virtual dom elements, `div()`, `span()` and all the standard HTML tags can be used this way. It's very similar to `ScalaTags`, you can read more [here]().

The actual API comes from the left facing arrow `<--`. It's one of the two main operators in OutWatch.
What it does is, listen to the Observable you pass and updates the DOM accordingly.
This works with children, like with the `child` attribute, but also with any HTML Attributes.

To demonstrate we're going to take a look at another example, where we'll create a checkbox,
which will hide a view if checked. This will also demonstrate how to get an Observable from a DOM Event.

{% highlight scala %}
val toggleEvents = createInputHandler()

val root = div(
  label("Hide view"),
  input(tpe := "checkbox", change --> toggleEvents),
  h2(hidden <-- toggleEvents.map(_.target.checked), "Visible!")
)

OutWatch.render("#app", root)
{% endhighlight %}

There's quite a few things to digest here, so let's start from the top.

First up, there's `createInputHandler`, it creates an `Observable` that is also a `Sink`.
We'll take a look at `Sink`s in more detail later,
but the next thing to note here is the right facing arrow `-->`,
which pipes all the `change` events of our checkbox into the `toggleEvents` Observable.

Then we can use it, map it to the `checked` value of the checkbox and pipe it into the `hidden` attribute of our `h2`.

Pretty simple so far, right? Now let's take a closer look at the return type of `createInputHandler()`.

An `Observable with Sink` is an Observable that can also receive Events,
i.e. it's both a Source and a Sink of events. If you're familiar with Rx,
they're very similar to Subjects.
If we inject such these into a component, we can "forward" the events generated in the component,
so `toggleEvents` emits an event every time our checkbox is changed.

Now the last thing to note is that we write `tpe` instead of `type`, because `type` is a keyword.
We could've also written `inputType` or ``type`` in backticks.
For more on differences between HTML and the DOM DSL check [here]().

Our next example is going to be a very simple example with two input fields, for first and last name.
We then want to combine those two fields into full name that will update when either field changes.
In order to do that, we're going to make use of the `combineLatest` operator:

{% highlight scala %}
val firstNameEvents = createInputHandler
val lastNameEvents = createInputHandler

val firstNames = firstNameEvents.map(_.target.value).startWith("")
val lastNames = lastNameEvents.map(_.target.value).startWith("")

val fullNames = firstNames
  .combineLatestWith(lastNames)((first, last) => s"$first $last")

val root = div(
  input(input --> firstNameEvents, placeholder:= "First Name"),
  input(input --> lastNameEvents, placeholder:= "Last Name"),
  h3("Hello, ", child <-- fullNames)
)

OutWatch.render("#app", root)
{% endhighlight %}

`combineLatest` takes another Observable and emits an element, whenever one of the original Observables emit.
Here's a diagram to visualize exactly that:

![CombineDiagram]({{ site.url }}/img/CombineMarbles.png)

So now we've seen the `child` attribute in action multiple times, but what if we want multiple children.
Instead of an Observable of a single element, we would need an Observable of a Sequence.
And that's exactly what we can do with the `children` attribute.

Here's a quick example:
{% highlight scala %}
val lists = Observable.of(List(1,2,3),List(4,5,6))
div(children <-- lists)
{% endhighlight %}

This makes it pretty easy to build dynamic lists, which are very common in a lot of applications.
Let's see how we can use this to build a small application.

We're gonna build a slider, whose value will determine the size of a dynamic list of images.
Sounds awfully useful, doesn't it?

Nevertheless we're gonna try and tackle this.
We're gonna map each emited value to a List and fill it with `n` `img` elements.
Also to make it easy, we divide every value by `2`,
because by default HTML Range sliders will go from `0` to `100`:

{% highlight scala %}
val sliderEvents = createInputHandler

val imageLists = sliderEvents
  .map(_.target.valueAsNumber / 10)
  .map(n => List.fill(n)(img(src := imageUrl)))

val root = div(
  input(tpe := "range", input --> sliderEvents, value := 0),
  div(children <-- imageLists)
)

OutWatch.render("#app", root)
{% endhighlight %}

You may have noticed that the pattern where we extract a number from an `InputEvent` is very common.
This begs the questions, do we even need the `InputEvent`? Most of the time, the answer to that is no.
Exactly because it is so common we've come up with a way to make this common implementation more concise.

Instead of
{% highlight scala %}
input(inputType := "range", input --> events)
val numbers = events.map(_.target.valueAsNumber)
{% endhighlight %}
we can write:
{% highlight scala %}
input(inputType := "range", inputNumber --> numbers)
{% endhighlight %}


We can do the same for input types that return `Boolean`s or `String`s
{% highlight scala %}
//This
input(inputType := "checkbox", input --> events)
val booleans = events.map(_.target.checked)

//can be turned into this:
input(inputType := "checkbox", inputBool --> booleans)
{% endhighlight %}

And also
{% highlight scala %}
//This
input(inputType := "text", input --> events)
val strings = events.map(_.target.value)

//can be turned into this:
input(inputType := "text", inputString --> strings)
{% endhighlight %}


In our [next chapter](), we're going to be looking at how we can encapsulate our code into small reusable components.










---
