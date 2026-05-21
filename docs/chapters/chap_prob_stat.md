---
title: Probability and Statistics
---

# Probability and Statistics

## Introduction

In this chapter, we venture into new territory, where we have to deal with uncertainty in a principled manner -- "probability and statistics" enables this. The term probability is typically associated with predicting the future; e.g., probability of win/loss in sports/elections or the probability of rain on a particular day on weather reports. On the other hand, the term statistics is associated with inferring something about the past, from data. For example, the average age of voters in Pennsylvania in the $2024$ elections. In this chapter, we will explore both probability and statistics at an introductory level and learn the interplay between the two.

### Applications

Applications of probability and statistics are widespread. In aerospace engineering, we highlight two specific applications. The first one is statistical mechanics which provides a microscopic view of thermodynamics -- that is, interpretation of measurable thermodynamic quantities, such as pressure and temperature, in terms of the arrangement of molecules among discrete energy states. This is given by the famous "Boltzmann" equation: 

```{math}
S = k \log \omega,
```

 where $S$ is the thermodynamic entropy, $k$ is called the "Boltzmann constant" and $\omega$ is the number of permutations possible in arranging the molecules across all available discrete energy states (also known as "microstates"). Naturally, higher the possible number of permutations, higher the "disorderliness" amongst molecules when they go through energy transfer, and hence higher the entropy. The entropy in the above Boltzmann equation can then be used to compute observable quantities such as pressure and temperature. The thermodynamics of high temperature gases, as in hypersonic flows for instance, require statistical mechanics to compute gas properties, which affects the aerothermodynamics of the flow.

Another application of interest is reliability analysis. That is, quantifying the "probability of failure" in aerospace systems. Aerospace vehicles, particularly those for commercial transport, are required to meet strict safety standards established by the Federal Aviation Administration (FAA). The process of testing and authorizing an aircraft for commercial operation and airworthiness is called "certification". The certification process by the FAA involves several systematic steps; one of them is to ensure the probability of failure of subsystems is low enough. For example, an aircraft engine may fail only once in a million flights or more. This quantity, that is the probability of failure, is computed as 

```{math}
p_F = \mathbb{P} \left( g(x) > a \right),
```

 where $\mathbb{P}$ denotes probability. $g(x)$ is called the "limit state function" which quantifies the performance of the system that can be related to failure -- for instance, the maximum Von Mises stress acting on a gas turbine blade. $a$ is a constant that defines the failure threshold e.g., a threshold on the maximum Von Mises stress that could lead to catastrophic failure of the blade. Finally, $x$ is some variable that is governed by a probability distribution. In practice, this probability cannot be computed using simple analytic simplifications; instead, approximate computations via, e.g., Monte Carlo sampling might be required.

In the rest of this chapter, we will formally introduce several fundamental concepts that underpin probability and statistics. This chapter is not meant to be exhaustive; rather, we aim to provide the reader with the foundation necessary to pursue the topic further with limited assistance.

## Measures of centrality and dispersion

We will now look at some commonly used statistical measures used to quantify the "centrality" (that is, the most common or typical value) and "dispersion" (that is, the spread) in the data. We will briefly introduce them along with examples. Later on, we will see that these definitions are special cases of centrality and dispersion measures of "random variables", which are necessary for the calculus of uncertain systems. In practice, we typically compute these measures on a finite data set; however, it is important to think of this data set as a finite sample extracted from some unknown "population". The estimates made on finite data must be consistent with the properties of the population. For instance, as we draw more and more samples from the population, the estimates of these measures must approach the true measures of the population.

Given a data set $\{x_1,\ldots,x_n\}$, we define the following:

- **Mean** is defined as 

```{math}
\bar{x} = \frac{1}{n}(x_1 + \ldots + x_n).
```

 Importantly, this definition of mean makes an implicit assumption that each entity in the set is equally likely---that is, they follow what is called a "uniform" distribution. For instance, we can equivalently write $\bar{x} = \sum_{i=1}^n w_i x_i$; when $w_i = 1/n,~\forall i$, then it reduces to the above equation. However, in practice, the $w_i$'s can be arbitrarily valued with $\sum_i w_i = 1$. The more general term for the mean is "expectation"; we will introduce random variables and expectations later.

- **Median** is defined as the *middle value* of a data set. In the case of data sets with an even number of entities, this is defined as the mean of the two middle values.

- **Mode** is defined as the most common entity of a data set.

- **Variance** measures the dispersion in the data set and is defined as 

```{math}
\sigma^2 = \frac{1}{n-1} ((x_1 - \bar{x})^2 + \ldots + (x_n - \bar{x})^2).
```

 You must think of variance of a set of numbers as the average square of the deviation from the mean. The $n-1$ in the denominator is a *correction* to ensure the estimate of the variance is unbiased. An "unbiased" estimate means that as $n\rightarrow \infty$, the estimate approaches the true variance of the population.

- **Standard deviation** is the square root of the variance and is therefore defined as 

```{math}
\sigma = \left \{ \frac{1}{n-1} ((x_1 - \bar{x})^2 + \ldots + (x_n - \bar{x})^2) \right \}^{1/2}.
```

 Note that $\sigma$ is a nonnegative measure.

- **Inter-quantile range** is another measure of dispersion and is defined as 

```{math}
\text{IQR} = q_U - q_L,
```

 where $q_U$ and $q_L$ are defined as the median of the "upper half" and "lower half" of the data set. Therefore, the data set must be sorted first before computing the IQR.

**Example.** Let $\mathbf{x} = \{6,6,4,2,1,7,0,4,6,7\}$ be the given data set. Then, the centrality and dispersion measures are summarized below.

- Mean $\bar{x} = \frac{6+6+4+2+1++0+4+6+7}{10}=4.3$.

- Variance $\sigma^2 = \frac{(6-4.3)^2+\ldots+(7-4.3)^2}{10-1} =6.46$.

- Standard deviation $\sigma = \sqrt{\frac{(6-4.3)^2+\ldots+(7-4.3)^2}{10-1}} = 2.541$.

- Median (after sorting $\mathbf{x}$) = $\frac{4+6}{2} = 5$.

- Mode = $6$.

- $\text{IQR} = q_U - q_L = 6-2=4$.

## Events and probabilities

We will now define a few terms that are required to calculate probabilities. An **event** is a set of unique outcomes in a process. For example, the set of numbers that show in a die roll: $\{1,3\}, \{2,3,4\}$, are all events. The **sample space** refers to all possible outcomes in a process; for example, in a die roll $\mathcal{S} = \{1,2,3,4,5,6\}$ and in a coin toss $\mathcal{S} = \{H,T\}$. Let $\mathcal{S}$ be a sample space and let A and B be two events in $\mathcal{S}$; that is, $A, B \in \mathcal{S}$. Then,

- **Union.** $A \cup B$ or A "union" B contains all outcomes of A or B. For example, if $A = \{1,2,3\}$ and $B = \{2,3,4\}$, $A \cup B = \{1,2,3,4\}$.

- **Intersection.** $A \cap B$ or A "intersection" B contains all outcomes in A and B. For instance, based on the above example, $A \cap B = \{2,3\}$.

  - When $A \cap B = \emptyset$, where $\emptyset$ is the empty set, then A and B are called *mutually exclusive* events. In plain terms, this means that there is nothing common between events $A$ and $B$, and when $A$ happens $B$ cannot happen, and vice versa.

- **Complement.** The complement of an event A, $A^c$ is the set of all outcomes in $\mathcal{S}$, that are not part of A. For the above example, $A^c = \{4,5,6\}$.

We are now ready to define probability. Let $A \in \mathcal{S}$, then the probability of A is given by 

```{math}
\mathbb{P} = \frac{\# \text{outcomes in A}}{\# \text{outcomes in }\mathcal{S}} ,
```

 with the following properties $0 \leq \mathbb{P}(A) \leq 1$ and $\mathbb{P}(A^c) = 1 - \mathbb{P}(A)$. That is, probability is a quantity that is always in the interval $[0, 1]$, and the sum of the probability of all possible events in a sample space should equal $1$. As we will see later, computing probabilities is all about being able to carefully count the number of outcomes in an event of interest and the sample space, and taking their ratio.

The following additional properties are worth noting.

- Let $A,B \in \mathcal{S}$, then 

```{math}
\mathbb{P}(A \cup B) = \mathbb{P}(A) + \mathbb{P}(B) - \mathbb{P}(A \cap B).
```



- If $A$ and $B$ are mutually exclusive, then 

```{math}
\mathbb{P}(A \cup B) = \mathbb{P}(A) + \mathbb{P}(B).
```

 since $\mathbb{P}(A \cap B) = 0$.

- For $n$ mutually exclusive events $A_1, \ldots, A_n$, 

```{math}
\mathbb{P}(A_1 \cup \ldots A_n) = \mathbb{P}(A_1) + \ldots + \mathbb{P}(A_n).
```



**Example.** For a coin toss $\mathcal{S} = \{H, T\}$. The event $H$ and $T$ are mutually exclusive, and thus, 

```{math}
\mathbb{P}(H \cup T) = \mathbb{P}(H) + \mathbb{P}(T) = \frac{1}{2} + \frac{1}{2} = 1.
```



For a die roll, let $A=\{1,3,5\}$ and $B=\{1,2,3\}$. Then, 

```{math}
\mathbb{P}(A \cup B) = \mathbb{P}(A) + \mathbb{P}(B) - \mathbb{P}(A \cap B) = \frac{3}{6} + \frac{3}{6} - \frac{2}{6} = \frac{2}{3}.
```



### Conditional probability

Sometimes two or more events are dependent such that the occurrence of one affects the chances of occurrence of the other. For instance, let $\mathbb{P}(A)$ denote the probability that you have Covid; currently this is likely very small and so, let's assume $\mathbb{P}(A) = 0.05$. Now, let the probability that a Covid test results in a true positive be $\mathbb{P}(B) = 0.9$; that is , we assume that the testing device is $90\%$ accurate in identifying a Covid infected person. Then, *conditional* on $B$, the probability of $A$, that is $\mathbb{P}(A|B)$, has to be more than $0.05$, right? That is, a positive test result can still be a "false positive"; however, once you have a positive test result, your chances of having Covid just went up from $0.05$. Therefore, $\mathbb{P}(A|B)$ has to be greater than $5\%$ because now we have more information (from the Covid test). We call $\mathbb{P}(A|B)$ the conditional probability of $A$.

General rule of conditional probability is the following: 

```{math}
\mathbb{P}(A|B) = \frac{\mathbb{P}(A \cap B)}{\mathbb{P}(B)}.
```

 A consequence of this are the following: 

```{math}
\begin{split}
    \mathbb{P}(A \cap B) = \mathbb{P}(A \mid B) \times \mathbb{P}(B) \\
    \mathbb{P}(A \cap B) = \mathbb{P}(B \mid A) \times \mathbb{P}(A).    
\end{split}
```

 The above identity can be exploited in situations where we might know only one of the two marginal probabilities: $\mathbb{P}(A)$ or $\mathbb{P}(B)$.

Crucially, if A and B are **independent**, then $\mathbb{P}(A|B) = \mathbb{P}(A)$ and hence we have 

```{math}
\mathbb{P}(A \cap B) = \mathbb{P}(A) \times \mathbb{P}(B).
```

 It is worth understanding the distinction between "independence" and "mutual exclusiveness". Independent events are events that don't affect the probability of each other. For instance, the probability that it will rain tomorrow in Seattle, is unlikely to depend on the probability that it will rain tomorrow in New York -- therefore they are independent events. On the other hand, mutually exclusive events cannot happen simultaneously. For instance, the event that it rains tomorrow in Seattle is mutually exclusive with the event that it won't rain tomorrow in Seattle.

Back to the Covid example, let $\mathbb{P}(A \cap B) = 0.85$. Then, the probability of having Covid given a positive test result is 

```{math}
\mathbb{P}(A|B) = \frac{0.85}{0.9} = 0.94.
```

 This should be intuitive---the chances of being Covid positive is $94\%$ after a positive test result despite chances of getting Covid itself is very low.

For $n$ **independent** events $A_1,\ldots,A_n$ 

```{math}
\mathbb{P}(A_1 \cap \ldots A_n) = \mathbb{P}(A_1) \times \ldots \mathbb{P}(A_n).
```



**Example.** Consider the situation with $10$ apples where $2$ are rotten and $8$ are good. You draw $2$ apples at random. What is the probability that both first and second apples are good?

The problem does not clarify if the two apples are drawn with or without replacement. Therefore, we will consider both scenarios. Furthermore, given the lack of additional information, we will assume that the two draws are independent of each other.

**Scenario 1:** *Without* replacement. Let $A$ denote the event of drawing the first apple and $B$ denote the event of drawing the second. Assuming $A$ and $B$ are independent, the probability of both being good is 

```{math}
\mathbb{P}(A \cap B) = \mathbb{P}(A) \times \mathbb{P}(B) = \frac{8}{10} \times \frac{7}{9} \approx 0.62.
```



**Scenario 2:** *With* replacement. Now, the probability is different because 

```{math}
\mathbb{P}(A \cap B) = \mathbb{P}(A) \times \mathbb{P}(B) = \frac{8}{10} \times \frac{8}{10} \approx 0.64.
```



**Example.** Now, let us consider the probability of picking one good and one rotten out of two draws, without replacement.

Notice that there are two possible scenarios here too: first draw is a rotten apple (call it $C1$) and the second draw is a rotten apple (call it $C2$).

**Event $\boldsymbol{C1}$.** Let $A1$ and $B1$ be the event of drawing the first and second apple, respectively. Then, 

```{math}
\mathbb{P} (C1) = \mathbb{P}(A1 \cap B1) = \mathbb{P}(A1) \times \mathbb{P}(B1)= \frac{2}{10} \times \frac{8}{9}.
```



**Event $\boldsymbol{C2}$.** Let $A2$ and $B2$ be the event of drawing the first and second apple, respectively. Then, 

```{math}
\mathbb{P} (C2) = \mathbb{P}(A2 \cap B2) = \mathbb{P}(A2) \times \mathbb{P}(B2)= \frac{8}{10} \times \frac{2}{9}.
```



Further, it is reasonable to assume $C1$ and $C2$ are mutually exclusive -- only either of them can occur at any given instant; this means that $\mathbb{P}(C1 \cap C2) = 0$. Therefore, the overall probability of drawing one rotten and one good apple without replacement is given by 

```{math}
\mathbb{P}(C1 \cup C2) = \mathbb{P}(C1) + \mathbb{P}(C2) - \mathbb{P}(C1 \cap C2) = \frac{2}{10} \times \frac{8}{9} + \frac{8}{10} \times \frac{2}{9} - 0 = \frac{32}{90}.
```



**Example.** You are throwing a dart onto a circular board; your target is a small circular disc at the center of the dart board. Every time you throw the dart, you have $1\%$ chance of hitting the target. What is your probability of hitting the target after $100$ attempts?

It is useful to treat every attempt as an event; further let's assume that your $100$ attempts are independent of each other. Then, we are given the following information 

```{math}
\mathbb{P}(\text{hitting target}) = 0.01, \quad \mathbb{P}(\text{missing target}) = 0.99.
```

 Probability of hitting the target in $100$ attempts should be interpreted as probability of hitting the target at least once in $100$ attempts. Therefore, the possible scenarios are: (i) hitting target in first attempt, (ii) hitting target in second attempt, $\ldots$, (C) hitting in the hundredth attempt. And, of course, the scenario that we miss the target in all 100 attempts.

Therefore, the probability of hitting in $100$ attempts can be quickly computed as $1 - \mathbb{P}(\text{missing all 100 attempts})$. That is 

```{math}
\mathbb{P}(\text{hitting in 100 attempts}) = 1 - (0.99)^{100} \approx 0.634.
```

 This should make intuitive sense: the more chances you have at the target, higher the probability that you will hit it.

## Permutations and combinations

Permutation refers to the arrangement of objects when the order of arrangement matters. For instance, given the following alphabets $\{\text{a,b,c,d,e}\}$, the possible $5$-letter words that can be constructed (not necessarily meaningful words) refers to the "permutations" of the set. Now, let us count the number of permutations. If no two alphabets can repeat, then, the first alphabet can be chosen in $5$ different ways, second one in $4$ ways, third one in $3$ ways and so on. Therefore the total permutations for this example without repetition is $5\times4\times3\times2\times1 = 120$. This is also denoted using the "factorial" notation $5! = 120$. With repetition, the number of permutations will be $5^5$ (why?). In general, $n$ unique objects can be arranged in $n!$ ways without replacement and $n^n$ with replacement.

### Classes of equal objects

If there are $6$ red and $4$ blue balls how many permutations are possible between the $10$ of them? All $10$ balls can be arranged in $10!$ ways. For each of these arrangements, the red balls are indistinguishable from each other, and hence, the $6!$ ways of arranging them (between themselves) is redundant. Likewise, the $4!$ ways of arranging the blue balls is redundant. Therefore, we need to factor out these two counts from the overall count to give 

```{math}
\# \text{ways of arranging the 10 balls} = \frac{10!}{6! \times 4!}.
```



Therefore, if there are $n$ objects with $c$ classes amongst them each with $n_1, \ldots, n_c$ items, then the number of permutations possible is given by 

```{math}
\# \text{ways of arranging the $n$ objects with $c$ classes} = \frac{n!}{n_1! \times \ldots n_c!},
```

 where $n = n_1 + n_2 + \ldots n_c$. **Example.** Let there be $6$ red and $4$ blue balls. What are the possible permutations with the first ball being a red and second being a blue ball?

The first ball can be chosen in $6$ ways and second one in $4$ ways. The remaining can be chosen in $8!$ ways. Therefore the total number of permutations is 

```{math}
\frac{6\times 4 \times 8!}{6!\times 4!}.
```



Now, let's calculate the probability that we can arrive at this arrangement. For this, we already counted the number of permutations. We just need to know the total number of permutations for all $10$ balls (that is, the sample space); then we take the ratio. The total number of permutations is 

```{math}
\frac{10!}{6!\times 4!}.
```

 Finally, the probability of arranging the $10$ balls such that first is red and second is blue is given by 

```{math}
\mathbb{P}(\text{First is red, second is blue}) = \frac{6\times 4 \times 8!}{10!}.
```



**Example.** Let's look at another example. How many $5$-letter words are possible in the English language without repetition? Using the same principle as above, this is calculated as $26\times25\times24\times23\times22$ which can also be written as $\frac{26!}{21!}$. In general, if there are $n$ unique objects, the number of ways of arranging $k$ at a time is given by $\frac{n!}{(n-k)!}$.

**Combinations** refer to choosing $k$ out of $n$ objects without any regard to order. For instance, given letters A, B, and C, the number of two-letter arrangements without repetition are AB, BC, and AC. With repetition, this would include $\{ \text{AB, BC, AC, AA, BB, CC} \}$.

In general, if there are $n$ objects, choosing $k$ combinations out of them is referred to as "n-choose-k" and denoted $n\choose{k}$, and given by 

```{math}
\begin{split}
        {n\choose k} =& \frac{n!}{(n-k)!} \quad \text{without repetition} \\
        {n\choose k} =& \frac{n!}{(n-k)! k!} \quad \text{with repetition}
    \end{split}
```

 For the alphabet example above, $n=3$, $k=2$; plug in these values to see if it agrees with the manual counting we did above.

## Random variables

A random variable is a function that maps some sample space $\mathcal{S}$ to the space of real numbers $\mathbb{R}$. The output of this function is a realization of this random variable, which varies according to some distribution. Circling back to ideas learned earlier in this chapter, you may think of these realizations to be individual events belonging to the sample space. Contrary to what we have seen thus far in this chapter, this sample space can be continuous and, thus, the number of possible events may be infinitely many. Such random variables are called continuous random variables. Likewise, discrete random variables belong to a sample space of discrete events. However, note that, sample spaces of discrete random variables can still have infinitely many events (e.g., space of all integers).

Random variables may be characterized by several standardized measures (similar to centrality and dispersion learned in the beginning of this chapter) -- we will review them now.

### Probability mass and density functions

Note that we will denote random variables with upper case alphabets e.g., $X$, and their realizations with lower case alphabets e.g., $x$.

For a discrete random variable $X$, with realizations $x_i,~i=1,2,\ldots$, the probability mass function is defined as 

```{math}
f_X(x_i) = \mathbb{P}(X = x_i) \qquad \text{Probability mass function}.
```

 That is, it is a function that captures the probability of every event ($x_i$) in the sample space of $X$. When $X$ is a continuous random variable with realizations $x$, the equivalent is called the probability density function defined as 

```{math}
\ f_X(x) = \mathbb{P}(X = x) \qquad \text{Probability density function}.
```



### Cumulative mass and density functions

For a discrete random variable $X$ with realizations $x_i,~i=1,2,\ldots$, the cumulative mass function is defined as the probability that $X$ is less than or equal to $x_i$: 

```{math}
F_X(x_i) = \mathbb{P}(X \leq x_i) = \sum_i f_X(x_i) \qquad \text{Cumulative mass function}.
```

 Likewise, when $X$ is a continuous random variable with realizations $x$, the equivalent is called cumulative density function defined as 

```{math}
F_X(x) = \mathbb{P}(X \leq x) = \int_{-\infty}^{x} f_X(x) dx \qquad \text{Cumulative mass function}.
```



Notice that the PDF and CDF are related -- that is, the CDF is an integral (summation in the discrete case) over the PDF. Likewise, the PDF can be interpreted as a derivative of the CDF. Therefore, the PDF of a random variable captures all the information necessary to characterize the random variable. We review some useful properties as follows.

### Some useful properties

- Probability of events computed via CDFs. 

```{math}
\mathbb{P}(a \leq X \leq b) = \int_{-\infty}^b f_X(x) dx - \int_{-\infty}^a f_X(x) dx = F_X(b) - F_X(a)
```



- Sum of probabilities of all events must equal $1$ -- recall that we saw this earlier. 

```{math}
\begin{split}
          \int_{-\infty}^{\infty} f_X(x) dx=1 \quad \text{continuous}\\
          \sum_i f_X(x_i) = 1  \quad \text{discrete}
      \end{split}
```



**Example.** Consider a random variable with density given by $f_X(x) = 0.75(1 - x^2)$, where $-1 \leq x \leq 1$.

1\. Compute its CDF. 

```{math}
\begin{split}
F_X(x) = \int_{-\infty}^x f_X(u) du =& \int_{-1}^x 0.75 \times (1 - u^2) du \\
=&   \left[ 0.75 \times (u - \frac{u^3}{3}) \right]_{-1}^x \\
=& 0.75 \times \left( \frac{-x^3 + 3x + 2}{3} \right)
\end{split}
```



2\. Find $\mathbb{P}(-1/2 \leq X \leq 1/2)$. From the definition of the CDF, we know that this is equal to 

```{math}
\begin{split}
\mathbb{P}(-1/2 \leq X \leq 1/2) =& F_X(1/2) - F_X(-1/2) \\
=& \frac{0.75}{3} \left( \left[ -\frac{1}{8} + \frac{3}{2} + 2 \right] - \left[ \frac{1}{8} - \frac{3}{2} + 2 \right] \right) \\
=& \frac{0.75}{3} \left( -\frac{1}{4} + 3 + 0 \right) = 0.6875.
\end{split}
```



3\. Let $\mathbb{P}(X \leq x) = 0.95$. What is $x$?

Essentially, we have that the CDF $F_X(x) = 0.95$; that is, 

```{math}
0.75 \times \left( \frac{-x^3 + 3x + 2}{3} \right) = 0.95.
```

 Then, $x$ may be determined by solving this nonlinear equation, e.g., via Newton-Raphson (do it yourself; the answer you must get is $x = 0.7293$).

### Moments of probability distributions

In general a "moment" of a function is some quantitative measure of its shape. If the function is the probability density (or mass) function, then its moments provide measures of centrality, dispersion, and other properties about the population of a random variable. So, in a sense, moments generalize the ideas of centrality and dispersion measures learned in the beginning of this chapter.

The $k$th order moment of a random variable with density (or mass) function $f_X(x)$ is defined as 

```{math}
\begin{split}
\mu_k =& \int_{-\infty}^{\infty} x^k f_X(x) dx \qquad \text{continuous} \\
\mu_k =& \sum_i x_i^k f_X(x_i)  \qquad \text{discrete}
  \end{split}
```

 The first moment ($k=1$) is the mean (aka "expectation"), the second moment ($k=2$) is the variance, and the third and fourth moments are called "skewness" and "kurtosis", respectively. We will expand a bit more on the first two moments.

**Expectation.** The expectation or mean of a random variable is the first moment and given by $\mu = \int_{-\infty}^{\infty} x f_X(x) dx$ (continuous RVs) and $\mu = \sum_i x_i f_X(x_i)$ (discrete RVs). Previously, we learned a formula for the mean of a data set: $\bar{x} = \frac{1}{n}(x_1 + \ldots + x_n)$ -- this can be interpreted as the first moment of a uniform discrete random variable with density $f_X(x_i) = 1/n$.

A few properties worth noting about expectations are as follows.

- Let $c$ be a constant, then $\mathbb{E}(c) = c$.

- Let $c$ be a constant and $X$ be a random variable, then $\mathbb{E}(cX) = c\mathbb{E}(X)$.

- Let $X$ and $Y$ be two random variables. Then, $\mathbb{E}(X + Y) = \mathbb{E}(X) + \mathbb{E}(Y)$.

**Variance.** Variance of a random variable is the second *central* moment and is given by 

```{math}
\mathbb{V}(X) = \sigma^2 = \int_{-\infty}^{\infty} (x - \mu)^2 f_X(x) dx \quad \text{(continuous)}
```

 

```{math}
\mathbb{V}(X) = \sigma^2 = \sum_i (x_i - \mu)^2 f_X(x_i) \quad \text{(discrete)},
```

 where $\mu$ is the mean (first moment). Note that we don't typically use $\mu_2$ to denote variance; instead, we denote it by $\sigma^2$.

By comparing against the expression for expectation, one can realize that the variance is also an expectation -- expectation of $(X - \mu)^2$: 

```{math}
\begin{split}
\mathbb{V}(X) =  \int_{-\infty}^{\infty} (x - \mu)^2 f_X(x) dx =& \mathbb{E}((X - \mu)^2) \\
=& \mathbb{E}(X^2 - 2\mu X + \mu^2) = \mathbb{E}(X^2) - \mathbb{E}(X)^2.
\end{split}
```



**Example.** Consider a random variable $X$ with uniform distribution $U(a,b)$; that is, the realizations $x$ of RV $X$ takes values in the interval $[a,b]$ with uniform probability. This is graphically illustrated in {numref}`fig:unipdf`. The density of such a distribution is given by $f_X(x) = \frac{1}{b-a}.$

```{figure} ../pics/uniformpdf.png
:width: 100%
:name: fig:unipdf

PDF of the uniform distribution $U(a,b)$.
```

The expectation of $X$ is given by 

```{math}
\mathbb{E}(X) = \int_a^b x\frac{1}{b-a} dx = \frac{1}{b-a} \left[ \frac{x^2}{2}\right]_a^b = \frac{b+a}{2}.
```

 So, the expectation of a uniform random variable (in one dimension) is the average of its bounds. Now, let us compute its variance. 

```{math}
\begin{split}
\mathbb{V}(X) = \int_a^b (x- \mu)^2 f_X(x) dx =&  \int_a^b (x- \frac{b+a}{2})^2 \frac{1}{b-a} dx \\
=& \frac{1}{b-a} \int_a^b x^2 -(b+a)x + \frac{(b+a)^2}{4} dx \\
=& \frac{(b-a)^2}{12}. 
\end{split}
```

 In other words, if we had knowledge that a given data set is derived from a uniform distribution, then we can compute its mean and variance using the above formula -- this is quick because it depends only on the bounds of the distribution. Also, the above formulas represent the "true" mean and variance (that is, that of the population) of the random variable, thanks to our knowledge of the PDF.

### Linear transformation of random variables

Sometimes we are interested in computing moments of some functions of a random variable in terms of its own moments. For instance, let $X$ be a random variable with mean $\mu$ and variance $\sigma^2$. Then, what is the mean and variance of the random variable $Y = g(X)$, where $g$ is some function? This finds wide spread applications; one example is in uncertainty propagation where $X$ might be the stochastic input to some system (e.g., the sensor measurements of the operating conditions of an aircraft) and $g(X)$ might be the aerodynamic forces acting on the aircraft. The distribution of $g(X)$ would inform how much the aerodynamic loading can vary during realistic operation of the aircraft.

Fortunately, if $g$ is a linear function, then moments of $g(X)$ can be easily computed in terms of the moments of $X$. If $g$ is nonlinear, then this is not straightforward to compute, and approximation techniques might be necessary, such as Monte Carlo simulation.

Let us illustrate this. Let $X$ be a random variable with mean $\mu_X$ and variance $\sigma_X^2$, and let $Y=a_1  + a_2 X$ be another random variable with constants $a_1$ and $a_2$. Then, what is the mean ($\mu_Y$) and variance ($\sigma_Y^2$) of $Y$ in terms of $\mu_X$ and $\sigma_X^2$?

Using the properties of the expectation we learned earlier, we can write 

```{math}
\mu_Y = \mathbb{E}(Y) = \mathbb{E}(a_1  + a_2 X) = \mathbb{E}(a_1) + a_2 \mathbb{E}(X) = a_1 + a_2 \mu_X.
```

 In other words, the expectation of a linear combination of a random variable is a linear combination of its expectation. However, note again this rule does not necessarily hold for a nonlinear combination.

The variance of $Y$ can be similarly computed, but with a bit more work.



```{math}
\begin{split}
\sigma_Y^2 = \mathbb{V}(Y) =& \mathbb{E}(Y - \mu_Y)^2 \\
=& \mathbb{E}(Y^2 - 2Y\mu_Y + \mu_Y^2) \\
=& \mathbb{E}(Y^2) -2\mu_Y\mathbb{E}(Y) + \mathbb{E}(\mu_Y^2) \\
=& \mathbb{E}(Y^2) - \mu_Y^2.
\end{split}
```

 We are not done yet because we intend to obtain an expression for $\sigma_Y^2$ in terms of $\mu_X$ and $\sigma_X^2$ -- this requires further simplification of $\mathbb{E}(Y^2)$ -- we do that next.



```{math}
\begin{split}
    \mathbb{E}(Y^2) =& \mathbb{E}(a_1^2 + 2a_1a_2X + a_2^2 X^2) \\
    =& a_1^2 + 2a_1 a_2 \mu_X + a_2^2 \mathbb{E}(X^2).
\end{split}
```

 We now have expressed $\mathbb{E}(Y^2)$ in terms of only $X$ and its moment $\mu_X$. We need to plug this expression into the previous expression for $\sigma_Y^2$. Doing so, we get 

```{math}
\begin{split}
\sigma_Y^2 =& \mathbb{E}(Y^2) - \mu_Y^2 \\
 =& a_1^2 + 2a_1 a_2 \mu_X + a_2^2 \mathbb{E}(X^2) - (a_1 + a_2 \mu_X)^2 \\
 =& a_1^2 + 2a_1 a_2 \mu_X + a_2^2 \mathbb{E}(X^2) - a_1^2 -2a_1a_2\mu_X - a_2^2 \mu_X^2 \\
 =& a_2^2(\mathbb{E}(X^2) - \mu_X^2) =  a_2^2(\mathbb{E}(X^2) - \mathbb{E}(X)^2) \\
 =& a_2^2 \sigma_X^2.
\end{split}
```

 In other words $\mathbb{V}(Y) = a_2^2 \mathbb{V}(X)$ -- that is, multiplying a random variable by a constant increases its variance by a factor of the square of the constant. Contrast this against the expectation, where multiplying by a constant increases the expectation by a factor of the constant (not its square).

### Standardized random variables

Using the identities learned in the previous section on linear transformation of random variables, it is often useful to *scale* a random variable such that it has a mean of $0$ and variance of $1$. This scaling is often called "standardization" and helps with better interpreting and analysing random variables.

Let $X$ be a random variable with mean $\mu$ and variance $\sigma^2$. Then, $Z = \frac{X - \mu}{\sigma}$ is a random variable with mean $0$ and variance $1$.

We will illustrate this with a simple example. Let $X \sim U(0,1)$ -- that is $X$ is a uniform random variable in the interval $[0,1]$. Let $Y = 2X + 3$ be another random variable. Then, $\frac{Y - \mu_Y}{\sigma_Y}$ must equal $X$ (which is the standardized $Y$) -- let's check.

We previously saw that $\mu_X = 1/2$ and $\sigma_X^2 = 1/12$. Similarly, using previously learned identities, $\mu_Y = 2 \times 1/2 + 3 = 4$ and $\sigma_Y^2 = 4 \times 1/12 = 1/3.$ Now let $Z = (Y - \mu_Y)/\sigma_Y$. Then, $\mathbb{E}(Z) = (\mathbb{E}(Y) - \mu_Y)/\sigma_Y = 0$ and $\mathbb{V}(Y) = \mathbb{V}(Y) / \sigma_Y^2 = 1$. Therefore, $Z$ is a uniform random variable with mean $0$ and variance $1$, which is the same as $X$. Note that, in this example, we considered a uniform random variable, but this property holds for any distribution $X$ may have.

### Normal random variable

Normal distribution, aka the "Gaussian" distribution, is arguably the most popular probability distribution finding widespread applications in the engineering and sciences. One reason for its popularity is that several natural phenomena tends to look like a normal distribution -- for instance, (i) the distribution of the height of all men in the world and (ii) the distribution of weights used in the pulley machine in a fitness center. Therefore, we will quickly review normal distribution and its properties in this section.

A normal random variable takes values in the interval $[-\infty, \infty]$ and is parametrized by a mean and a variance. A normal random variable $X$ is denoted $X \sim N(\mu, \sigma^2)$.

#### Probability density function

The PDF of a normal random variable $X \sim N(\mu, \sigma^2)$ is given by 

```{math}
f_X(x) = \frac{1}{\sigma \sqrt{2\pi}} \exp\left(- \frac{(x - \mu)^2}{2\sigma^2}  \right).
```

 A plot of the PDF of $X$ is shown in {numref}`fig:normal`; we summarize its salient points below.

```{figure} ../pics/normal.png
:width: 100%
:name: fig:normal

Probability density function of $X  \sim N(\mu, \sigma^2)$.
```

**Properties of the normal PDF.**

- Symmetric about $x = \mu$ -- this means that probability of events on either side of $x = \mu$ are equally likely. This property is exploited when we integrate the PDF, e.g., to compute probabilities of events.

- The mean, median, and mode of a normal random variable are identical.

- The PDF asymptotes to $0$ on either side of the mean.

- The interval $\pm 1 \sigma$ contains roughly $68\%$ of the area under the curve. Likewise, $\pm 2\sigma$ and $\pm 3\sigma$ contain $95.5\%$ and $99.7\%$, respectively. Note that only the interval $[-\infty, \infty]$ accounts for $100\%$ of the area under the curve.

#### Cumulative density function

The CDF of $X$ is given by 

```{math}
F_X(x) = \frac{1}{\sigma \sqrt{2\pi}} \int_{-\infty}^x \exp \left( -\frac{1}{2} \frac{(u - \mu)^2}{\sigma^2}\right)du.
```

 When $\mu=0$, $\sigma^2=1$, the CDF reduces to the standardized CDF given as 

```{math}
\Phi(z) = \frac{1}{\sigma \sqrt{2\pi}} \int_{-\infty}^z \exp \left( -\frac{u^2}{2} \right)du.
```

 This integral is related to the "error function" and its value for various values of $z \in [-\infty, \infty]$ is tabulated in several sources for direct look up -- this in turn makes computation of probabilities involving normal random variables very convenient, practically circumventing the main computation, namely integrating the PDF. A plot of the standard normal CDF is shown in {numref}`fig:normalcdf`; notice that the CDF is not symmetric unlike the PDF, and that it asymptotes to $0$ on the left and $1$ on the right. Furthermore, $\Phi(0) = 0.5$, in a way, reflecting the symmetry of the PDF.

```{figure} ../pics/normalcdf.png
:width: 100%
:name: fig:normalcdf

Cumulative density function of $Z  \sim N(0, 1)$.
```

As previously mentioned, the standard normal CDF is convenient while calculating probabilities involving normal random variables. Let's look at an example.

**Example.** Let $X$ be normally distributed as $X \sim N(0.8, 4)$ (that is $\mu=0.8$ and $\sigma^2=4$). Then, what is $\mathbb{P}(X \leq 2.44)$?

Let us first standardize the inequality: 

```{math}
\begin{split}
    \mathbb{P}(X \leq 2.44) =&     \mathbb{P}( \frac{X - \mu}{\sigma} \leq \frac{2.44 - \mu}{\sigma})  \\
    =& \mathbb{P}( Z \leq \frac{2.44 - 0.8}{2}) =  \mathbb{P}( Z \leq 0.82 ).
\end{split}
```

 Notice that $\mathbb{P}( Z \leq 0.82 ) = \Phi(0.82)$ -- looking up its value from the table, we get $\mathbb{P}( Z \leq 0.82 ) = 0.7939.$

We can also compute two-sided inequalities. For instance, let us compute $\mathbb{P}(1.0 \leq X \leq 1.8)$. After standardization, this can be shown to be equal to (do it yourself!) $\Phi(0.5) - \Phi(0.1) = 0.1517$.
