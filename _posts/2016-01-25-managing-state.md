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



We're going to try and further demonstrate our ability to effectively handle state management with a small but significant example.
Of course the canonical example is the infamous "Todo list application". So let's start with that, shall we?




//Redux style counter application w/ reducers
-- Single source of truth
//OutWatch style counter application
