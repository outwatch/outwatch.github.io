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

{% highlight scala %}
def headerComponent(title: String, hideSecond: Boolean) = {
  div(
    h1(title),
    h2(hidden := hideSecond, "This is the second title")
  )
}
{% endhighlight %}

So our `headerComponent` function takes a `String` and a `Boolean` as parameters and returns a Virtual DOM tree.
In our `main`-function we can now call this function and pass it to `OutWatch.render()`.
{% highlight scala %}
OutWatch.render("#app", headerComponent("Our Title", false))
{% endhighlight %}

Good job! We've created our first component!

> Since components are just functions, we can use all the cool stuff associated with them, namely currying, partial application and default parameters.
> For example we could create a partially applied function that only takes a Boolean as a parameter out of our `headerComponent` function as easily as this:
{% highlight scala %}
headerComponent("Our Title", _: Boolean))
{% endhighlight %}
> Likewise we could create default parameters by simply changing the function signature to this:
{% highlight scala %}
headerComponent(title: String, hideSecond: Boolean = false)
{% endhighlight %}
> This allows us a lot of flexibility and really enables us to easily reuse all our components.

___


Next we're going to look at a component that takes an `Observable` as a parameter.

### Input streams

When we pass an Observable into a component, it usually means the component is going to change whenever the Observable emits an element.
Of course, in practice we could do whatever we want with the stream, but unlike a component with just properties, these components usually feature some form of interactivity.
These types of components aren't usually used very often, but it's worth mentioning for the sake of completeness.

Here's an example for one such component:
{% highlight scala %}
def nameListComponent(nameLists: Observable[List[String]]) = {
  div(
    span(children <-- nameLists)
  )
}
{% endhighlight %}

These components are very useful to break up larger components into smaller ones. In other scenarios, it might be easier to use stateless components, components with only properties, and recreate them, when one of their values changes. We're going to look at this kind of technique later.

The next parameter we're going to look at are output streams.

### Output streams
Often times components will have some sort of events, you would like to pass to its parent component.
The easiest way to do this, is to specify a `Sink` as a parameter of the component.
That way, you can extract an `Observable` from a child component.
Here's an example of a very simple component:
{% highlight scala %}
def inputComponent(labelText: String, textValues: Sink[String]) = {
  div(
    label(labelText),
    input(inputString --> textValues)
  )
}
{% endhighlight %}

This delegates the `String`s emited from the textfield to the parent component.
In the parent component, we would instantiate such a component like this:

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

We pass a `Sink[String]` to our component and it will forward the events to our `names`-Observable.
Then we can take that Observable and bind it to the child of our `h2` element.

The cool thing about this, is that by the look of the function you can immediately see what it's inputs and outputs are.
That means you can easily swap out components with the same function signature.

For example, let's say, instead of a textfield, we'd like a button, that (for whatever reason) always emits the text in the label. We'd just need to replace the call to `inputComponent` with another function with the same signature.
Our `inputComponent` has the signature `(String, Sink[String]) => VNode`, so our new component should have the same.

{% highlight scala %}
def buttonComponent(labelText: String, textValues: Sink[String]) = {
  div(
    label(labelText),
    button(click(labelText) --> textValues)
  )
}
{% endhighlight %}

This isn't a very useful component, but it demonstrates two things.
First, how easy it is to replace components, if they have the same signature and second, that we can take any DOM event, and write a value after it in parentheses to transform each emission to the value in the brackets.

This is roughly equivalent to calling the `mapTo` operator on the resulting `Observable` and allows us to declare emissions in a more concise way.
In most of our use cases, we don't really care about the `MouseEvent`, that the `click` event emits.

Another thing we can do in the same way, is transform a DOM event to the latest emission of an `Observable`, by passing it in parantheses.

Let's look at a quick example, by replacing our `inputComponent`, with another component, this time, with a component, that has two textfields for first and last names and a button to submit the names to the parent component:

{% highlight scala %}
def personComponent(labelText: String, texts: Sink[String]) = {
  val firstNames = createStringHandler()
  val lastNames = createStringHandler()

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

In this example, we use two streams and two textfields internally, but since the signature is still the same, swapping it out for our original component doesn't require any changes in our parent component.

Since the component is so decoupled, we can work on it separately. For example, we'd like to disable the submit button if the full name is less than 4 characters long. To do that we need an `Observable`, that emits a Boolean value everytime the full name is changed and checks if the name is long enough.
Here's a pretty easy way to go about it:

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
+   button(click(fullNames) --> texts, disabled <-- disableEvents, "Submit")
  )
}
 
{% endhighlight %}

___

Our component still isn't perfect, so we're going to do one last thing.
Right now if you've followed this guide so far, you've probably noticed, that when we run the application above, that every time we click the submit button, our textfields don't get cleared.

So let's go and add some functionality for that.
Since we want the textfields to clear everytime we press the submit button, we're going to need an `Observable`, that emits an empty string `""` everytime we press on it.
There are different ways to do it, but for now, here's a pretty simple solution, that works with what we've learned so far.

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

And with that, we conclude this chapter.

We learned about how components help us structure our code into small reusable modules. We also learned about the different types of parameters passed into functions and how we can transform event streams declaratively.

In the next [chapter](/managing-state.html), we're going to talk about how to manage state effectively.
