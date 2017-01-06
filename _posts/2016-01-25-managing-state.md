---
title: "Managing state"
tags: chapters
---

Managing state can be a very tricky thing in larger applications.
Demonstrating a good and simple method for managing state using small applications as examples is even harder.
We already gave some good arguments for how reactive programming can vastly improve state management in our [Reactive UI Programming chapter](/reactive-ui-programming), now how about we look at how this actually works.

Let's jump right into our first example, a very simple counter application.
It has a "+" button and a "-" button, that each add or subtract one from a counter.
It's not the coolest application you can find, but it shows how we can keep state between interactions.

So in essence, we want to create two streams, merge them and keep state between them.
Let's start by creating the app with the two streams.
{% highlight scala %}

val additions = createHandler[Int]
val subtractions = createHandler[Int]

val root = div(
  div(
    button(click(1) --> additions, "+"),
    button(click(-1) --> subtractions, "-"),
    span("Count: ")
  )
)

OutWatch.render("#app", root)
{% endhighlight %}

So far, so good, we now have to streams representing our additions and our subtractions.
Notice how we use a custom handler of type `Int`.
We can do this for any type we like by simply calling the `createHandler[]` function with any type.

Next up, we're going to want to merge our streams together. We can use the `merge` function for that.
What it does, is just take all the emissions from both streams and emit them all into a new third stream.

Here's a diagram to demonstrate how this works:

![Merge Diagram]({{ site.url }}/img/MergeMarbles.png)

So let's add a third stream as a result of our first two streams.

{% highlight diff %}
//..

+ val operations = subtractions.merge(additions)

//...
{% endhighlight %}

Great, now we're almost there!
Now we only need to keep state somehow. If you remember the `scan` operator from our [Streams chapter](/streams#scan), you're on the right path.

Here's a quick reminder on what it does:

> `scan` is a lot like `fold` or `reduce` but creates intermediary values every time.
>Folds in functional programming iterate a sequential data structure like a list and
> "reduces" or "folds" it into a single element.
> `scan` however accumulates state every time the stream emits, so we don't get a single element, but a stream of accumulated elements.

The `scan` function takes two arguments. A `seed` and a `reducer function`.
The reducer function is a function with the following signature.
{% highlight scala %}
(previousState, nextElement) => newState
{% endhighlight %}

The `previousState` is also often called the `accumulator` and the `nextElement` is also often called the `current`.
These can then be shortened to `acc` and `cur`, which you've probably seen somewhere before.

The seed is the initial value, that is used for the accumulator, when the first element is emitted.
In our case, we'd like to start with `0`, so we specify `0` as our seed.

Let's change our code to reflect the things we just talked about.

{% highlight diff %}
//..

- val operations = subtractions.merge(additions)
+ val state = subtractions.merge(additions)
+   .scan(0)((acc, cur) => acc + cur)

val root = div(
  div(
    button(click(1) --> plusClicks, "+"),
    button(click(-1) --> handleMinus, "-"),
-   span("Count: ")
+   span("Count: ", child <-- state)
  )
)

//...
{% endhighlight %}

And now we got our first stateful application. Awesome!

If you're still having some trouble wrapping your head around what we just did, here's the continuation of the diagram we saw before:

![Scan Diagram]({{ site.url }}/img/AddScanMarbles.png)


Okay great, that was pretty simple, so we're going to try and further demonstrate our ability to effectively handle state management with a small but significant example.

### A simple Todo list

Of course the canonical example is the infamous "Todo list application". So let's build one, shall we?

We're gonna use the exact same methodology we used before.
We're going to need two streams, one for adding Todo items and one for deleting them.
Also, we're gonna use components to modularize our code properly.

First let's define a component for our text input field.
We already wrote a similar one in the last chapter, so this shouldn't be all that new to you.

{% highlight scala %}
def textFieldComponent(outputEvents: Sink[String]) = {

  val textValues = createStringHandler()

  val disabledValues = textValues
    .map(_.length < 4)
    .startWith(true)

  div(
    label("Todo: "),
    input(inputString --> textValues),
    button(
      click(textValues) --> outputEvents,
      disabled <-- disabledValues,
      "Submit"
    )
  )
}
{% endhighlight %}

So far so easy. Whenever we press the submit button, we just pass the current text value to the parent component.
This will represent our "Add stream".

Next, we'll create a todo item component. It will take a todo as a property and it will output delete events.

{% highlight scala %}
def todoComponent(todo: String, deleteEvents: Sink[String]) = {
  li(
    span(todo),
    button(click(todo) --> deleteEvents, "Delete")
  )
}
{% endhighlight %}

Okay, that's easy too, we emit the todos to our "Delete stream".
Now comes the more tricky part. We're gonna have to merge those two streams and keep state between emissions.
With numbers it was kinda easy, but lists can be a bit trickier.

Let's look at some code:

{% highlight scala %}
val addEvents = createStringHandler()
val deleteEvents = createStringHandler()

def addToList(todo: String) = {
  (list: List[String]) => list :+ todo
}

def removeFromList(todo: String) = {
  (list: List[String]) => list.filterNot(_ == todo)
}

val additions = addEvents.map(addToList _)
val deletions = deleteEvents.map(removeFromList _)

val merged = additions.merge(deletions)

{% endhighlight %}

This might be a bit difficult to understand right know, so we're gonna go through it piece by piece.

First, our `addToList` and `removeFromList` functions take a todo as parameter and return a function *that modifies a list*.
The type of our `merged` stream is `Observable[List[String] => List[String]]`.

So it's a stream of modifier functions, that take a list as parameter and return a modified list, either with an element appended or with an element removed.

So what can we do with this kind of stream? Well `scan` of course!

{% highlight diff %}

//..

- val merged = additions.merge(deletions)
+ val state = additions.merge(deletions)
+   .scan(List[String]())((list, modify) => modify(list))

{% endhighlight %}

Boom! This gives us a stream of lists, which we can then display.
However currently our list is just a list of strings.
Before we display the list we should map it to our `todoComponent`s.

Remember that our `todoComponent`, takes a todo as an input and also a `Sink` of todos to delete.
With that in mind, we should now change our code to this:

{% highlight scala %}

//..

val state = adds.merge(deletes)
  .scan(List[String]())((list, modify) => modify(list))

val listViews = state
  .map(_.map(todo => todoComponent(todo, deleteEvents)))

{% endhighlight %}

Whew, that was quite something, but now we have a list of views, which we can bind to the children of a `ul` element.

So let's do just that:

{% highlight scala %}
//...

val root = div(
  textFieldComponent(inputHandler),
  ul(children <-- listViews)
)

OutWatch.render("#app", root)
{% endhighlight %}

You made it! If you run this, you should get a fully working todo application.
It doesn't quite have all the features, we can think of, but it's enough as basis.
Implementing the rest shouldn't be too difficult, if you understood what we were doing here.


## Different state management architectures

OutWatch as a library isn't really opinionated as to what sort of architecture, you'd like to use.
You can come up with all kinds of different ways to manage state.
A very popular way of handling state is found in [Redux](http://redux.js.org/) and in the [Elm Architecture](https://guide.elm-lang.org/architecture/).

They both rely on what's called `Actions` and `Reducers` in Redux or `Messages` and `Update` in Elm.
If you've used these before, you probably noticed that `scan` is very very similar to these kinds of approaches.

Next, we'd like to show you how easy we can implement this architecture with only very little changes to our code.

First, we're gonna define our `Action` or `Msg` type.  
For our small counter app, these are gonna be very very simple.

{% highlight scala %}
sealed trait Action

case class Add() extends Action
case class Subtract() extends Action
{% endhighlight %}

This is fairly straightforward. Now let's add a model for our application state and an initial value for that model.

{% highlight scala %}
type State = Int

val initialState = 0
{% endhighlight %}

Our model is just a super simple `Int`, since it's the only thing that can actually change in our app.
Next, we'll want to create a `reducer` or `update` function.
It's going to have the following type:

{% highlight scala %}
(previousState, action) => newState
{% endhighlight %}

This looks eerily similar to the functions we usually pass to our `scan` function. Let's just keep that in the back of our mind fow now and start implementing this function:

{% highlight scala %}
def reducer(previousState: Int, action: Action) = action match {
  case Add() => previousState + 1
  case Subtract() => previousState - 1
}
{% endhighlight %}

That's pretty easy so far.
The cool thing here is, that the compiler will warn if you forget to an action type in your pattern matching.
With only two action types this isn't all that useful, but it ensures that there's no runtime error cause because your action doesn't match any of the types.

Now we need some kind of store to send our actions to, and receive our new state.
This is pretty straightforward as well:

{% highlight scala %}
val storeSink = createHandler[Action]

val storeSource = storeSink
  .scan(initialState)(reducer)
  .startWith(initialState)
{% endhighlight %}

We now have a `Sink` where we can dispatch our actions into and a `Source` that will emit a new state every time an action is dispatched.

Now we can rewrite our view very easily:

{% highlight scala %}
div(
 button(click(Add()) --> storeSink, "+"),
 button(click(Subtract()) --> storeSink, "-"),
 span("Count: ", child <-- storeSource)
)
{% endhighlight %}

That's all we need to do for now, however it's very easy to imagine a full implementation to get rid of the boilerplate when creating such a store.

Here's a very simple such implementation:

{% highlight scala %}
case class Store[T, U](initialState: T, reducer: (T,U) => T) {
  val sink = createHandler[U]
  val source = sink
    .scan(initialState)(reducer)
    .startWith(initialState)

  def subscribe(f: T => Unit) = storeSource.subscribe(f)
}
{% endhighlight %}

So simple, in fact, that it's been included in the `outwatch.util` package.
With that knowledge in mind, we can refactor our code like this:

{% highlight diff %}


- val initialState = 0

- val storeSink = createHandler[Action]

- val storeSource = storeSink
-  .scan(initialState)(reducer)
-  .startWith(initialState)

+ val store = Store(0, reducer)

div(
- button(click(Add()) --> storeSink, "+"),
- button(click(Subtract()) --> storeSink, "-"),
- span("Count: ", child <-- storeSource)
+ button(click(Add()) --> store, "+"),
+ button(click(Subtract()) --> store, "-"),
+ span("Count: ", child <-- store)
)
{% endhighlight %}


This makes for really pretty and declarative code.
As our last exercise we're going to port our todo application to our Action-based style.

Let's get right into it, by defining all the easy stuff:

{% highlight scala %}
sealed trait Action
case class AddTodo(todo: String) extends Action
case class RemoveTodo(todo: String) extends Action

Object State {

}

Object Main extends JSApp {

  val initialState = List[String]()

  def reducer (currentState: List[String], action: Action) = action match {
    case AddTodo(todo) => currentState :+ todo
    case RemoveTodo(todo) => currentState.filter(_ != todo)
  }

  val store = Store(initialState, reducer)

  def main() = {
    val root = div(
      textFieldComponent(),
      ul(children <-- listViews)
    )

    OutWatch.render("#app", root)
  }

  //..
}

{% endhighlight %}

This should look familiar to you by now.
An interesting thing here, is that our `textFieldComponent` no longer requires a `Sink` as a parameter, because we centralized our state in the state store. However this is just an option, we could just as easily pass the store only to those components who actually need it and don't make it available globally.

The only thing actually left to do now, is refactor our `textFieldComponent` and our `todoComponent` to our new architecture.

First let's check out the new `todoComponent`:

{% highlight scala %}
- def todoComponent(todo: String, deleteEvents: Sink[String]) = {
+ def todoComponent(todo: String) = {
  li(
    span(todo),
-    button(click(todo) --> deleteEvents, "Delete")
+    button(click(RemoveTodo(todo)) --> store, "Delete")
  )
}

{% endhighlight %}

This change is fairly easy to grasp.
We dispatch `RemoveTodo` actions to our store when we click the delete button.
The `textFieldComponent` is gonna have a bit more changes.

Let's look at it now.

{% highlight scala %}
def textFieldComponent() = {
  val inputValues = createStringHandler()

  val disabledValues = inputValues
    .map(_.length < 4)
    .startWith(true)

  val submissions = createHandler[String]

  val addActions = submissions
    .map(todo => AddTodo(todo))

  store <-- addActions

  div(
    label("Todo: "),
    input(inputString --> inputValues),
    button(
      click(inputValues) --> submissions,
      disabled <-- disabledValues,
      "Submit"
    )
  )
}
{% endhighlight %}

A few things have changed here, but I'm sure by now you can understand what we're doing here.
The only thing I'd like to call attention to, is this line:

{% highlight scala %}
store <-- addActions
{% endhighlight %}

Our `store` is just a `Sink` and, if their types match up, we can use any Observable and pipe all it's emissions into a `Sink` by using the left facing arrow `<--`.
In this case we have a `Sink[Action]` and an `Observable[Action]`, so this just works.
This is another way in which OutWatch allows you to manipulate event streams in a declarative matter.

However, the reason why we've waited so long to show you this method, is because delegating from one Observable to another like this, can lead to misdirection and confusion in debugging. So don't rely on it too much and only use it when you don't see another option.

And with that, we've fully reimplemented our two small apps with very little effort.

### Conclusion

In this chapter we wanted to give you a good overview over the similarities and differences between these two architectural styles.
In the end it's up to you decide which architecture best suits your app.
So keep the trade-offs in mind and make an informed decision on what's best for your application.
