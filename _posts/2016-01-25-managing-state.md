---
title: "Managing state"
tags: chapters
---

Managing state can be a very tricky thing in larger applications.
Demonstrating a good and simple method for managing state using small applications as examples is even harder.
We already gave some good arguments for how reactive programming can vastly improve state management in our <a onclick="window.location='/reactive-ui-programming'+window.location.search;">Reactive UI Programming chapter</a>, now how about we look at how this actually works.

Let's jump right into our first example, a very simple counter application.
It has a "+" button and a "-" button, that each add or subtract one from a counter.
It's not the coolest application you can find, but it shows how we can keep state between interactions.

So in essence, we want to create two streams, merge them and keep state between them.
Let's start by creating the app with the two streams.
{% include switch-tab-widget.html %}
<div class="lang-specific scala">
{% highlight scala %}

val additions = createHandler[Int]()
val subtractions = createHandler[Int]()

val root = div(
  button(click(1) --> additions, "+"),
  button(click(-1) --> subtractions, "-"),
  span("Count: ")
)

OutWatch.render("#app", root)
{% endhighlight %}
</div>
<div class="lang-specific purescript">
{% highlight haskell %}

let additions = createHandler[]
    subtractions = createHandler[]

    root = div
      [ button[mapE click (const 1) ==> additions, text "+"]
      , button[mapE click (const -1) ==> additions, text "-"]
      , span [text "Count: "]
      ]

in OutWatch.render "#app" root
{% endhighlight %}
</div>

So far, so good, we now have to streams representing our additions and our subtractions.
Notice how we use a custom handler of type `Int`.
<span class="lang-specific scala" markdown="1">We can do this for any type we like by simply calling the generic `createHandler[]` function with any type.</span><span class="lang-specific purescript" markdown="1">We can do this for any type we like by simply calling the generic `createHandler[]` function and the compiler will simply infer the type.</span>

Next up, we're going to want to merge our streams together. We can use the `merge` function for that.
What it does, is just take all the emissions from both streams and emit them all into a new third stream.

Here's a diagram to demonstrate how this works:

![Merge Diagram]({{ site.url }}/img/MergeMarbles.png)

So let's add a third stream as a result of our first two streams.

{% include switch-tab-widget.html %}
<div class="lang-specific scala">
{% highlight diff %}
//...

+ val operations = subtractions.merge(additions)

//...
{% endhighlight %}
</div>
<div class="lang-specific purescript">
{% highlight diff %}
  ...

+     operations = merge subtractions additions

  ...
{% endhighlight %}
</div>

Great, now we're almost there!
Now we only need to keep state somehow. If you remember the `scan` operator from our [Streams chapter](/streams#scan), you're on the right path.

Here's a quick reminder on what it does:

> `scan` is a lot like `fold` or `reduce` but creates intermediary values every time.
>Folds in functional programming iterate a sequential data structure like a list and
> "reduces" or "folds" it into a single element.
> `scan` however accumulates state every time the stream emits, so we don't get a single element, but a stream of accumulated elements.

The `scan` function takes two arguments. A `seed` and a `reducer function`.
The reducer function is a function with the following signature.
<div class="lang-specific scala">
{% highlight scala %}
(previousState, nextElement) => newState
{% endhighlight %}
</div>
<div class="lang-specific purescript">
{% highlight haskell %}
nextElement -> previousState -> newState
{% endhighlight %}
</div>

The `previousState` is also often called the `accumulator` and the `nextElement` is also often called the `current`.
These can then be shortened to `acc` and `cur`, which you've probably seen somewhere before.

The seed is the initial value, that is used for the accumulator, when the first element is emitted.
In our case, we'd like to start with `0`, so we specify `0` as our seed.

Let's change our code to reflect the things we just talked about.

{% include switch-tab-widget.html %}
<div class="lang-specific scala">
{% highlight diff %}
//...

- val operations = subtractions.merge(additions)
+ val state = subtractions.merge(additions)
+   .scan(0)((acc, cur) => acc + cur)

val root = div(
  button(click(1) --> plusClicks, "+"),
  button(click(-1) --> handleMinus, "-"),
- span("Count: ")
+ span("Count: ", child <-- state)
)

//...
{% endhighlight %}
</div>
<div class="lang-specific purescript">
{% highlight diff %}
  ...

-     operations = merge subtractions additions
+     state = (merge subtractions additions)
+       # scan (+) 0

      root = div
        [ button[mapE click (const 1) ==> additions, text "+"]
        , button[mapE click (const -1) ==> additions, text "-"]
-       , span[text "Count: "]
+       , span[text "Count: ", child <== state]
        ]

  ...
{% endhighlight %}
</div>
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

{% include switch-tab-widget.html %}
<div class="lang-specific scala">
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
</div>
<div class="lang-specific purescript">
{% highlight haskell %}
textFieldComponent :: forall e. SinkLike e String _ -> VDom e
textFieldComponent outputEvents =
  let textValues = createStringHandler[]

      disabledValues = textValues.src
        # map (\s -> length s < 4)
        # startWith true

  in div
    [ label [text "Todo: "]
    , input [inputString ==> textValues]
    , button
      [ override click textValues.src ==> outputEvents
      , disabled <== disabledValues
      , text "Submit"
      ]
    ]
{% endhighlight %}
</div>
So far so easy. Whenever we press the submit button, we just pass the current text value to the parent component.
This will represent our "Add-stream".

Next, we'll create a todo item component. It will take a todo as a property and it will output delete events.

<div class="lang-specific scala">
{% highlight scala %}
def todoComponent(todo: String, deleteEvents: Sink[String]) = {
  li(
    span(todo),
    button(click(todo) --> deleteEvents, "Delete")
  )
}
{% endhighlight %}
</div>
<div class="lang-specific purescript">
{% highlight haskell %}
todoComponent :: forall e. String -> SinkLike e String _ -> VDom e
todoComponent todo deleteEvents =
 li
   [ span [text todo]
   , button [ mapE click (const todo) ==> deleteEvents , text "Delete" ]
   ]
{% endhighlight %}
</div>
Okay, that's easy too, we emit the todos to our "Delete-stream".
Now comes the more tricky part. We're gonna have to merge those two streams and keep state between emissions.
With numbers it was kinda easy, but lists can be a bit trickier.

Let's look at some code:

{% include switch-tab-widget.html %}
<div class="lang-specific scala">
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
</div>
<div class="lang-specific purescript">
{% highlight haskell %}
let addEvents = createStringHandler[]
    deleteEvents = createStringHandler[]

    addToList todo list = snoc list todo
    removeFromList todo list = list # filter (_ /= todo)

    additions = addEvents.src # map addToList
    deletions = deleteEvents.src # map removeFromList

    merged = merge additions deletions
{% endhighlight %}
</div>
This might be a bit difficult to understand right know, so we're gonna go through it piece by piece.

First, our `addToList` and `removeFromList` functions take a todo as parameter and return a function *that modifies a list*.
The type of our `merged` stream is <span class="lang-specific scala" markdown="1">`Observable[List[String] => List[String]]`</span><span class="lang-specific purescript" markdown="1">`Observable (Array String -> Array String)`</span>.

So it's a stream of modifier functions, that take a list as parameter and return a modified list, either with an element appended or with an element removed.

So what can we do with this kind of stream? Well `scan` of course!
The accumulator function that we pass to is basically just function application, since we're going to have a list of todos and a function that takes a list of todos and also returns a list of todos.
Here's how that looks in its most verbose version for posterity:

{% include switch-tab-widget.html %}
<div class="lang-specific scala">
{% highlight diff %}

//...

- val merged = additions.merge(deletions)
+ val state = additions.merge(deletions)
+   .scan(List.empty[String])((list, fn) => fn.apply(list))

{% endhighlight %}
</div>
<div class="lang-specific purescript">
{% highlight diff %}

    ...

-   merged = merge additions deletions
+   state = (merge additions deletions)
+     # scan (\modify list -> modify list) []

{% endhighlight %}
</div>

If you have trouble understanding what's going on,
 here's another marble diagram to help you visualize what we're doing:

![Scan Diagram]({{ site.url }}/img/ScanMarblesList.png)

Boom! This gives us a stream of lists, which we can then display.
However currently our list is just a list of strings.
Before we display the list we should map it to our `todoComponent`s.

Remember that our `todoComponent`, takes a todo as an input and also a `Sink` of todos to delete.
With that in mind, we should now change our code to this:

{% include switch-tab-widget.html %}
<div class="lang-specific scala">
{% highlight scala %}

//...

val state = adds.merge(deletes)
  .scan(List.empty[String])((list, fn) => fn.apply(list))

val listViews = state
  .map(_.map(todo => todoComponent(todo, deleteEvents)))

{% endhighlight %}
</div>
<div class="lang-specific purescript">
{% highlight haskell %}

    ...

    state = (merge additions deletions)
      # scan (\modify list -> modify list) []

    listViews = state
      # map (map (\todo -> todoComponent todo deleteEvents))

{% endhighlight %}
</div>

Whew, that was quite something, but now we have a list of views, which we can bind to the children of a `ul` element.

So let's do just that:

<div class="lang-specific scala">
{% highlight scala %}
//...

val root = div(
  textFieldComponent(addEvents),
  ul(children <-- listViews)
)

OutWatch.render("#app", root)
{% endhighlight %}
</div>
<div class="lang-specific purescript">
{% highlight haskell %}

    ...

    root = div
      [ textFieldComponent addEvents
      , ul[children <== listViews]
      ]
in OutWatch.render "#app" root
{% endhighlight %}
</div>

You made it! If you run this, you should get a fully working todo application.
It doesn't quite have all the features, we can think of, but it's enough as basis.
Implementing the rest shouldn't be too difficult, if you understood what we were doing here.
As an exercise, you could change the `textFieldComponent` to automatically clear, when we submit a ToDo.
We already did something similar in the last chapter, so check there if you're unsure how to continue.

## Different state management architectures

OutWatch as a library isn't really opinionated as to what sort of architecture, you'd like to use.
You can come up with all kinds of different ways to manage state.
A very popular way of handling state is found in [Redux](http://redux.js.org/) and in the [Elm Architecture](https://guide.elm-lang.org/architecture/).

They both rely on what's called `Actions` and `Reducers` in Redux or `Messages` and `Update` in Elm.
If you've used these before, you probably noticed that `scan` is very very similar to these kinds of approaches.

Next, we'd like to show you how easy we can implement this architecture with only very little changes to our code.

First, we're gonna define our `Action` or `Msg` type.  
For our small counter app, these are gonna be very very simple.

{% include switch-tab-widget.html %}
<div class="lang-specific scala">
{% highlight scala %}
sealed trait Action

case object Add extends Action
case object Subtract extends Action
{% endhighlight %}
</div>
<div class="lang-specific purescript">
{% highlight haskell %}
data Action = Add | Subtract
{% endhighlight %}
</div>


This is fairly straightforward. Now let's add a model for our application state and an initial value for that model.
<div class="lang-specific scala">
{% highlight scala %}
type State = Int

val initialState = 0
{% endhighlight %}
</div>
<div class="lang-specific purescript">
{% highlight haskell %}
type State = Int

initialState :: State
initialState = 0
{% endhighlight %}
</div>

Our model is just a super simple `Int`, since it's the only thing that can actually change in our app.
Next, we'll want to create a `reducer` or `update` function.
It's going to have the following type:


<div class="lang-specific scala">
{% highlight scala %}
(previousState, action) => newState
{% endhighlight %}
</div>
<div class="lang-specific purescript">
{% highlight haskell %}
action -> previousState -> newState
{% endhighlight %}
</div>

This looks eerily similar to the functions we usually pass to our `scan` function. Let's just keep that in the back of our mind for now and start implementing this function:


<div class="lang-specific scala">
{% highlight scala %}
def reducer(previousState: State, action: Action) = action match {
  case Add => previousState + 1
  case Subtract => previousState - 1
}
{% endhighlight %}
</div>
<div class="lang-specific purescript">
{% highlight haskell %}
reducer :: Action -> State -> State
reducer action previousState =
  case action of
    Add -> previousState + 1
    Subtract -> previousState - 1
{% endhighlight %}
</div>

That's pretty easy so far.
The cool thing here is, that the compiler will warn if you forget to an action type in your pattern matching.
With only two action types this isn't all that useful, but it ensures that there's no runtime error cause because your action doesn't match any of the types.

Now we need some kind of store to send our actions to, and receive our new state.
This is pretty straightforward as well:

{% include switch-tab-widget.html %}
<div class="lang-specific scala">
{% highlight scala %}
val storeSink = createHandler[Action]()

val storeSource = storeSink
  .scan(initialState)(reducer)
  .startWith(initialState)
{% endhighlight %}
</div>
<div class="lang-specific purescript">
{% highlight haskell %}
let storeSink = createHandler[]

    storeSource = storeSink
      # scan reducer initialState
      # startWith initialState
{% endhighlight %}
</div>
We now have a `Sink` where we can dispatch our actions into and a `Source` that will emit a new state every time an action is dispatched.

Now we can rewrite our view very easily:

<div class="lang-specific scala">
{% highlight scala %}
div(
 button(click(Add) --> storeSink, "+"),
 button(click(Subtract) --> storeSink, "-"),
 span("Count: ", child <-- storeSource)
)
{% endhighlight %}
</div>
<div class="lang-specific purescript">
{% highlight haskell %}
div
  [ button[mapE click (const Add) ==> storeSink, text "+"]
  , button[mapE click (const Subtract) ==> storeSink, text "-"]
  , span[text "Count:", child <== storeSource]
  ]
{% endhighlight %}
</div>
That's all we need to do for now, however it's very easy to imagine a full implementation to get rid of the boilerplate when creating such a store.

Here's a very simple such implementation:

<div class="lang-specific scala">
{% highlight scala %}
case class Store[T, U](initialState: T, reducer: (T,U) => T) {
  val sink = createHandler[U]
  val source = sink
    .scan(initialState)(reducer)
    .startWith(initialState)

  def subscribe(f: T => Unit) = storeSource.subscribe(f)
}
{% endhighlight %}
</div>
<div class="lang-specific purescript">
{% highlight haskell %}
createStore :: forall eff state action.
               state
            -> (action -> state -> state)
            -> Store eff state action
createStore initialState reducer =
  let handler = createHandler[]
      src = handler.src
        # scan reducer initialState
        # startWith initialState
      sink = handler.sink
  in { src, sink }
{% endhighlight %}
</div>

So simple, in fact, that it's been included in the <span class="lang-specific scala" markdown="1">`outwatch.util` package</span><span class="lang-specific purescript" markdown="1">`OutWatch.Store` module</span>.
With that knowledge in mind, we can refactor our code like this:

<div class="lang-specific scala">
{% highlight diff %}


- val initialState = 0

- val storeSink = createHandler[Action]

- val storeSource = storeSink
-  .scan(initialState)(reducer)
-  .startWith(initialState)

+ val store = Store(0, reducer)

div(
- button(click(Add) --> storeSink, "+"),
- button(click(Subtract) --> storeSink, "-"),
- span("Count: ", child <-- storeSource)
+ button(click(Add) --> store, "+"),
+ button(click(Subtract) --> store, "-"),
+ span("Count: ", child <-- store)
)
{% endhighlight %}
</div>
<div class="lang-specific purescript">
{% highlight diff %}

- let storeSink = createHandler[]

-     storeSource = storeSink
-       # scan reducer initialState
-       # startWith initialState

+ let store = createStore initialState reducer

  in div
-  [ button[mapE click (const Add) ==> storeSink, text "+"]
-  , button[mapE click (const Subtract) ==> storeSink, text "-"]
-  , span[text "Count:", child <== storeSource]
+  [ button[mapE click (const Add) ==> store, text "+"]
+  , button[mapE click (const Subtract) ==> store, text "-"]
+  , span[text "Count:", child <== store.src]
   ]
)
{% endhighlight %}
</div>
This makes for really pretty and declarative code.
As our last exercise we're going to port our todo application to our Action-based style.

Let's get right into it, by defining all the easy stuff:

{% include switch-tab-widget.html %}
<div class="lang-specific scala">
{% highlight scala %}
sealed trait Action
case class AddTodo(todo: String) extends Action
case class RemoveTodo(todo: String) extends Action
case class UpdateText(value: String) extends Action


case class State(text: String, todos: Seq[String])

object Main extends JSApp {

  val initialState = State("", Seq.empty[String])

  def reducer(state: State, action: Action) = action match {
    case UpdateText(newValue) => state.copy(text = newValue)
    case RemoveTodo(todo) => state.copy(todos = state.todos.filter(_ != todo))
    case AddTodo => state.copy(
      todos = state.todos :+ state.text,
      text = ""
    )
  }

  val store = Store(initialState, reducer)

  val listViews = store
    .map(_.todos.map(todoComponent))

  def main() = {
    val root = div(
      textFieldComponent(),
      ul(children <-- listViews)
    )

    OutWatch.render("#app", root)
  }

}

{% endhighlight %}
</div>
<div class="lang-specific purescript">
{% highlight haskell %}
data Action
  = AddTodo
  | RemoveTodo String
  | UpdateText String

type State = { text :: String, todos :: Array String }

initialState :: State
initialState = { text : "" , todos : [] }

reducer :: Action -> State -> State
reducer action state = case action of
  (UpdateText newValue) -> state { text = newValue }
  (RemoveTodo todo) -> state { todos = state.todos # filter (_ /= todo) }
  AddTodo -> state { todos = snoc state.todos state.text
      , text = ""
    }

store :: forall e. Store e State Action
store = createStore initialState reducer

listViews :: forall e. Observable (Array (VDom e))
listViews = store.src
  # map (\state -> state.todos # map todoComponent)

main :: Eff (vdom :: VDOM) Unit
main =
  let listViews = store.src
      # map (\state -> state.todos # map todoComponent)

      root = div
        [ textFieldComponent "Todos: "
        , ul [ children <== listViews ]
        ]
    in render "#app" root
{% endhighlight %}
</div>
This should look familiar to you by now.
An interesting thing here, is that our `textFieldComponent` no longer requires a `Sink` as a parameter, because we centralized our state in the state store. However this is just an option, we could just as easily pass the store only to those components who actually need it and don't make it available globally.

The only thing actually left to do now, is refactor our `textFieldComponent` and our `todoComponent` to our new architecture.

First let's check out the new `todoComponent`:

{% include switch-tab-widget.html %}
<div class="lang-specific scala">
{% highlight diff %}
- def todoComponent(todo: String, deleteEvents: Sink[String]) = {
+ def todoComponent(todo: String) = {
  li(
    span(todo),
-    button(click(todo) --> deleteEvents, "Delete")
+    button(click(RemoveTodo(todo)) --> store, "Delete")
  )
}

{% endhighlight %}
</div>
<div class="lang-specific purescript">
{% highlight diff %}
- todoComponent :: forall e. String -> SinkLike e String _ -> VDom e
- todoComponent todo deleteEvents =
+ todoComponent :: forall e. String -> VDom e
+ todoComponent todo =
    li
      [ span [text todo]
-     , button [ mapE click (const todo) ==> deleteEvents , text "Delete" ]
+     , button [ mapE click (const (RemoveTodo todo)) ==> store , text "Delete" ]
      ]
 {% endhighlight %}
 </div>
This change is fairly easy to grasp.
We dispatch `RemoveTodo` actions to our store when we click the delete button.
The `textFieldComponent` is gonna have a bit more changes.

Let's look at it now.
{% include switch-tab-widget.html %}
<div class="lang-specific scala">
{% highlight scala %}
def textFieldComponent() = {

    val textFieldValues = store
      .map(_.text)

    val disabledValues = store
      .map(_.text.length < 4)
      .startWith(true)

    div(
      label("Todo: "),
      input(
        inputString(UpdateText) --> store,
        value <-- textFieldValues
      ),
      button(
        click(AddTodo) --> store,
        disabled <-- disabledValues,
        "Submit"
      )
    )
  }
{% endhighlight %}
</div>
<div class="lang-specific purescript">
{% highlight haskell %}
textFieldComponent :: VDom e
textFieldComponent =
  let textValues = store.src
        # map _.text

      disabledValues = textValues
        # map (\s -> length s < 4)
        # startWith true
  in
    div
      [ label [text "Todo: "]
      , input
        [ mapE inputString UpdateText ==> store
        , value <== textValues
        ]
      , button
        [ mapE click (const AddTodo) ==> store
        , disabled <== disabledValues
        , text "Submit"
        ]
      ]
{% endhighlight %}
</div>
A few things have changed here, but I'm sure by now you can understand what we're doing here.

And with that, we've fully reimplemented our two small apps with very little effort.

### Conclusion

In this chapter we wanted to give you a good overview over the similarities and differences between these two architectural styles.
In the end it's up to you decide which architecture best suits your app.
So keep the trade-offs in mind and make an informed decision on what's best for your application.

{% include switch-tab-sources.html %}
