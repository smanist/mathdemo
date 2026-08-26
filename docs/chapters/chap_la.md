```{sectnum}
:depth: 5
```

# Introduction to Linear Algebra

## Learning objectives

In this chapter, we provide an introduction to linear algebra that is designed to help the reader pursue advanced topics that involve computations with matrices and vectors. The chapter is designed such that no prior exposure to the topic is necessary for the reader. The specific learning objectives of this chapter include

+ Understanding matrices and vectors, and their relationship.
+ Exposure to common notations and nomenclature used in linear algebra.
+ Exposure to special types of matrices.
+ Introduction to performing elementary operations with matrices.
+ Interpreting certain operations with and properties of matrices.


## Introduction

The word "algebra" is derived from the Arabic word "al-jabr" meaning the *science of restoring and balancing*. It is due to a Persian polymath, Mohammed al-Khwarizmi, who lived circa 800 CE. In today's parlance, algebra refers to the study of variables and rules for manipulating the variables in systems of equations. Therefore *linear* algebra refers to the algebra of linear systems; that is, systems involving only the *first power of the variables of interest*. This begs the question: *what is nonlinear algebra?* Of course, that would be algebra that is not linear, but more importantly, it refers to a different field called "algebraic topology", which deals with curves and surfaces which can be viewed as geometric objects and as solutions of algebraic equations. Nonlinear algebra is outside the scope of this module.

This document is meant to be a *quick* review of linear algebra fundamentals. We will review concepts pertinent to *real valued* matrices---complex valued matrices are out of scope.

## Review of Basics

### Notations

Notations are important and play a key role in communicating mathematics. Here are some notations that you must get comfortable with for this module. It is very important to learn the nuances behind these notations.

- **Scalars** are denoted by regular lowercase English alphabets, e.g., $x=1,~y=4e-6$.

- **Vectors** are denoted by boldface lowercase English alphabets, e.g., $\mathbf{x}=\begin{bmatrix}
          1 \\ 
          2 \\
          3
      \end{bmatrix}$, $\mathbf{y}=\begin{bmatrix}
          10^{-6} \\ 
          -2\times 10^{-4} \\
          0
      \end{bmatrix}$. As you can see, a vector is a stack of scalars.

- **Matrices** are denoted by regular uppercase English alphabets $X=\begin{bmatrix}
          1 & 2 \\ 
          -2 & 1 \\
      \end{bmatrix}$. As you can see, a matrix is a stack of vectors. A matrix can be seen as a stack of row vectors e.g., $\begin{bmatrix}\begin{array}{cccc}
  &&& \\
  \hline \\
  \hline \\
  \hline \\
  \end{array} \end{bmatrix}$ , or column vectors e.g., $\begin{bmatrix}\begin{array}{c|c|c|c}
  &&& \\
  &&& \\
  &&& \\
  &&& \\
  \end{array} \end{bmatrix}$. So, naturally a vector can be considered a matrix with 1 row or column.

- A vector or matrix may contain both real-valued or complex-valued elements. We denote the set of all real numbers by $\mathbb{R}$ and the set of all complex numbers by $\mathbb{C}$.

  - When a vector, of length $m$, contains only real numbers, then each of its elements belongs to $\mathbb{R}$; this is written mathematically as $\mathbf{x} \in \mathbb{R}^m$.

  - When an $m\times n$ matrix contains only real numbers, then each of its elements belongs to $\mathbb{R}$; this is written mathematically as $X \in \mathbb{R}^{m\times n}$.

- **Matrix shapes.** A matrix with $m$ rows and $n$ columns is referred to as an $m\times n$ (pronounced *m-by-n*) matrix.

- **Transposition.** Transposing a vector or matrix is the operation that interchanges its rows for columns. It is denoted by the superscript $\top$. For example, $\mathbf{x}=\begin{bmatrix}
          1 \\ 
          2 \\
          3
      \end{bmatrix} = [1, 2, 3]^\top$. $X=\begin{bmatrix}
          1 & 2 \\ 
          -2 & 1 \\
      \end{bmatrix}$, then $X^\top=\begin{bmatrix}
          1 & -2 \\ 
          2 & 1 \\
      \end{bmatrix}$. Transposition inverts the shape of a matrix: if $A$ is $m\times n$, then $A^\top$ is $n\times m$.

  - The transpose of the product of two matrices is the product of their transposes: $(AB)^\top = B^\top A^\top$.

- **Column stack.** An $m\times n$ matrix can be expressed as a column stack of $n$ column vector: $A = [\mathbf{a}_1, \mathbf{a}_2, \ldots, \mathbf{a}_n]$, where each $\mathbf{a}_i \in \mathbb{R}^m,~\forall i=1,\ldots,n$.

  - For example, let $A=\begin{bmatrix}
            1 & 2 \\ 
            -2 & -1 \\
        \end{bmatrix}$, then $\mathbf{a}_1 = \begin{bmatrix}
            1\\
            -2
        \end{bmatrix}$ and $\mathbf{a}_2 = \begin{bmatrix}
            2\\
            -1
        \end{bmatrix}$.

- **Row stack.** An $m\times n$ matrix can also be expressed as a row stack of $m$ row vectors. Note that the columns of $A^\top$ are the rows of $A$. Let $(\mathbf{a}^\top)_i,~i=1,\ldots,m$ denote the $m$ rows of $A$. Then $A$ can be written as : $A = \begin{bmatrix}
      (\mathbf{a}^\top)_1 \\
      (\mathbf{a}^\top)_2 \\
      \vdots \\
      (\mathbf{a}^\top)_m
  \end{bmatrix}$.

  - For example, let $A=\begin{bmatrix}
            1 & 2 \\ 
            -2 & 1 \\
        \end{bmatrix}$, then $(\mathbf{a}^\top)_1 = [1, 2]$ and $(\mathbf{a}^\top)_2 = [-2, 1]$.

  - Note a subtlety here: we place a parenthesis around $\mathbf{a}^\top$ to denote that it is a column of $A^\top$.

- **Index notation.** The rows are typically indexed by $i$ and columns by $j$. Given a matrix $A$,

  - The element of $A$ in the $i$th row and $j$th column is referred as $a_{ij}$. Equivalently, the same element may also be referred as $A_{ij}$. $A = \begin{bmatrix}
                a_{11} & a_{12} & \ldots & a_{1n} \\
                a_{21} & a_{22} & \ldots & a_{2n} \\
                \vdots & \vdots & \vdots & \\
                a_{m1} & a_{m2} & \ldots & a_{mn} \\
            \end{bmatrix}.$

  - The matrix $A$ can be expressed as $A = [a_{ij}],~\forall i=1,\ldots,m,~j=1,\ldots,n$. Note that the symbol $\forall$ denotes "for all".

### Types of matrices

A matrix is a structured collection of numerical elements (typically reals, integers, or complex numbers). As we previously saw, a matrix is also a stack of row or column vectors. However, if we see beyond just rows and columns in a matrix, we might be able to see some structure that we can potentially exploit in computations. According to this structure, we can classify matrices into various types, some of which are illustrated below.

- **Square matrices.** A matrix that has identical number of rows and columns. E.g., $A = \begin{bmatrix}
          1 & 0 & 2\\
          0 & 2 & 1\\
          1 & 1 & 3
      \end{bmatrix}$ has shape $3\times 3$. Transposition does not alter the shape of such matrices $\text{shape}(A)=\text{shape}(A^\top)$. A square matrix has special significance in linear systems---it conveys that the system is *closed*, that is, the system has as many equations as the number of unknowns. Whether such a system has a solution (or not, or has many solutions) is another matter and we will see that later. A matrix that is not square is called rectangular, e.g., $B = \begin{bmatrix}
          1 & 0 & 2\\
          0 & 2 & 1
      \end{bmatrix}.$

  - For square matrices, we can identify the "diagonal" of the matrix which is defined as $\text{diag}(A) = a_{ii}, ~\forall i = 1,\ldots, n$.

- **Symmetric matrices.** Matrices that are *unchanged* under transposition: $A = A^\top$. For example, $A = \begin{bmatrix}
          1 & 0 & 1\\
          0 & 2 & 1\\
          1 & 1 & 3
      \end{bmatrix} = A^\top.$ A straightforward advantage of symmetric matrices is that, for a matrix $A \in \mathbb{R}^{n\times n}$ you only need to store $\frac{n(n+1)}{2}$ elements (why?).

- **Skew-symmetric matrices.** Transposition results in scalar multiplication by $-1$: $A^\top = -A$. For example, $A = \begin{bmatrix}
          0 & 2 \\
          -2 & 0
      \end{bmatrix}$. A skew symmetric matrix must have the diagonal elements as $0$'s. Why?

- For any two real-valued matrices of shape $n\times n$, $A + A^\top$ is always symmetric; and $A - A^\top$ is always skew-symmetric! Check this yourself.

- **Diagonal matrices.** A diagonal matrix is a square matrix that has nonzero elements only along its diagonal. E.g., $A = \begin{bmatrix}
          2 & 0 & 0 \\
          0 & -1 & 0 \\
          0 & 0 & 4 \\
      \end{bmatrix}$. The benefit of diagonal matrices are aplenty. Storing the matrix requires only storing $n$ elements. There are several advantages to converting a matrix to a diagonal matrix (when it can be done) and we will see them later.

  - A special type of diagonal matrix is the *identity* matrix which is a diagonal matrix of only $1$'s and $0$'s; e.g., $I_3 = \begin{bmatrix}
                1 & 0 & 0 \\
                0 & 1 & 0 \\
                0 & 0 & 1 \\
            \end{bmatrix}$. Note that $I_3$ is notation for a $3\times 3$ identity matrix.

- **Triangular matrices.** Square matrices with all elements above or below the diagonal being all $0$'s are called *lower triangular* and *upper triangular*, respectively. For example. $A = \begin{bmatrix}
          2 & 2 & -1 \\
          0 & -1 & 0 \\
          0 & 0 & 4 \\
      \end{bmatrix}$ is upper triangular and $A = \begin{bmatrix}
          2 & 0 & 0 \\
          0 & -1 & 0 \\
          1 & -1 & 4 \\
      \end{bmatrix}$ is lower triangular. What about $A = \begin{bmatrix}
          2 & 0 & 0 \\
          0 & -1 & 0 \\
          0 & 0 & 4 \\
      \end{bmatrix}$? Is it upper or lower triangular? Triangular matrices require storing the same number of elements as a symmetric matrix of the same size. Why? We will later see that triangular matrices are a desirable form to arrive at when solving linear systems.

- **Orthogonal matrices.** Matrices in which the dot product of any two columns is $0$! The dot product of a column with itself is $1$! So, orthogonal matrices foreshadow a new concept, an elementary matrix operation called the "dot product", formally introduced in the matrix addition section (you are encouraged to pause and review it before proceeding further.) Consider the Givens rotation matrix $A = \begin{bmatrix}
          \cos(\theta) & -\sin(\theta)\\
          \sin(\theta) & \cos(\theta)
      \end{bmatrix}$. $\mathbf{a}_1^\top \mathbf{a}_1 = \cos^2(\theta)+\sin^2(\theta)=1$, $\mathbf{a}_1^\top \mathbf{a}_2 = -\cos(\theta)\sin(\theta) + \sin(\theta)\cos(\theta)=0$.

  - A cool thing about orthogonal matrices is that $A^\top A = I$. That is, the product of itself with its transpose is an identity matrix. Any such matrix, that when multiplied with another matrix, resulting in an identity matrix is called it's inverse. That is, if $AB=I$, then $B$ is the "inverse" of $A$. Therefore, the inverse of the matrix is its transpose: $A^{-1}=A^\top$! This is a very useful property. As we will see later, computing the inverse of a general square matrix, when it exists, is a computationally intensive process. However, for orthogonal matrix, it is simply its transpose---that is, one could swap the rows with columns to obtain its inverse.

  - A linear transformation (formally introduced in the later linear transformation section) with an orthogonal matrix leaves the length of the vector unchanged: $\|\mathbf{x}\|_2=\|A\mathbf{x}\|_2$.

We now proceed to discussing elementary matrix operations. Whenever applicable, we will demonstrate how the special properties of certain types of matrices discussed above simplify these matrix operations.

### Elementary matrix operations

We now introduce two fundamental elementary operations with matrices namely, addition and multiplication. These operations are building blocks of more complex operations with matrices that we will see in subsequent chapters.

#### Matrix Addition

The addition of two matrices $A$ and $B$ is possible only if they have the same shape. For two matrices of identical shape, the matrix sum is just an elementwise addition. For example, $X=\begin{bmatrix}
        1 & -2 \\ 
        2 & 1 \\
    \end{bmatrix}$, $Y=\begin{bmatrix}
        1 & 2 \\ 
        2 & 1 \\
    \end{bmatrix}$, then $X + Y =\begin{bmatrix}
        2 & 0 \\ 
        4 & 2 \\
    \end{bmatrix}$. Mathematically, if $C=A+B$, then $c_{ij} = a_{ij} + b_{ij},~\forall i=1,\ldots,m ~j=1,\ldots,n$.

The addition operation is commutative; that is, $A+B = B+A$. We will see later that not all matrix operations share this property.

#### Matrix Multiplication

```{figure} ../pics/M1_vector_geom.png
:name: fig-vector-geom
:width: 70%
:align: center

Visualization of vectors.
```

Before delving into matrix multiplication, we will quickly review some concepts behind vectors.

##### Geometric Meaning of a Vector

A vector $\mathbf{x} = [x_1, x_2, \ldots, x_n]^\top$ can be construed as a line that connects the origin $(0, 0,\ldots,0)$ to the point $(x_1, x_2, \ldots, x_n)$. For example, the vectors $\mathbf{x} = [1, 1]^T$ and $\mathbf{y} = [1, 2]^T$ can be visualized in the figure below. The length of the vector, then, can be conveniently expressed as the distance to the origin. This is also called the $2$-norm or $\ell_2$ norm of the vector $\mathbf{x}$: $\|\mathbf{x}\|_2 = \sqrt{x_1^2 + x_2^2 + \ldots, x_n^2}$. In the same figure, the length of vector $\mathbf{x}$ is $\|\mathbf{x}\|_2 = (1^2 + 1^2)^{1/2} = \sqrt{2}$ and that of $\mathbf{y}$ is $\|\mathbf{y}\|_2 = (1^2 + 2^2)^{1/2} = \sqrt{5}$.

##### Dot Product

Let's quickly review an important elementary operation with vectors, called the *dot product*. A dot product between two vectors of identical shape $\mathbf{x} \in \mathbb{R}^n$ and $\mathbf{y} \in \mathbb{R}^n$ is defined as

```{math}
\text{dot}(\mathbf{x}, \mathbf{y}) = \mathbf{x}^\top \mathbf{y}=\sum_{i=1}^n x_i y_i.
```

For instance, let $\mathbf{x}=[1, 2, 3]^\top$ and $\mathbf{y}=[2, 1, 3]^\top$ then, $\mathbf{x}^\top \mathbf{y} = 1\times 2 + 2\times 1 + 3 \times 3 = 13.$ Note that the dot product of two vectors is a scalar. Its magnitude measures the "similarity" between two vectors; vectors are completely dissimilar when their dot product is zero: $\mathbf{x}^\top \mathbf{y}=0$. Such vectors are called *orthogonal* vectors, e.g., the due north and due east directions. Its sign indicates if the increase in one vector results in the increase in the other; some illustrations are shown in the figure below.

The length of a vector is then the square-root of its dot product with itself: $\|\mathbf{x}\|_2 = (\mathbf{x}^\top \mathbf{x})^{1/2}.$

```{figure} ../pics/M1_dotprod.png
:name: fig-dotprod
:width: 100%
:align: center

Geometric meaning of the dot product.
```

Now, we are ready to talk about matrix multiplication. Two matrices $A \in \mathbb{R}^{m\times n}$ and $B \in \mathbb{R}^{p\times q}$ can be multiplied only if $n=p$; that is, the number of columns in $A$ must equal the number of rows in $B$. The resulting matrix product $C=A\times B$ is then of shape $m \times q$.

- If $A$ is $3 \times 4$ and $B$ is $4 \times 2$, then $C=A\times B$ is $3 \times 2$.

- If $A$ is $1 \times 4$ and $B$ is $4 \times 1$, then $C=A\times B$ is a scalar and the matrix product is also a vector dot product!

- If $A$ is $4 \times 1$ and $B$ is $1 \times 4$, then $C=A\times B$ is $4 \times 4$ and the matrix product is also called an *outer product*!

The matrix product can be performed in 3 common ways.

1.  **Dot product approach.** Let $A \in \mathbb{R}^{m \times n}$ and $B \in \mathbb{R}^{n \times q}$, then

```{math}
C = A  B = \begin{bmatrix}
            (\mathbf{a}^\top)_1 \mathbf{b}_1 & (\mathbf{a}^\top)_1 \mathbf{b}_2 & \ldots & (\mathbf{a}^\top)_1 \mathbf{b}_q \\
            (\mathbf{a}^\top)_2 \mathbf{b}_1 & (\mathbf{a}^\top)_2\mathbf{b}_2 & \ldots & (\mathbf{a}^\top)_2 \mathbf{b}_q \\
            \vdots & \ldots & \ldots & \ldots \\
            (\mathbf{a}^\top)_m \mathbf{b}_1 & (\mathbf{a}^\top)_m \mathbf{b}_2 & \ldots & (\mathbf{a}^\top)_m \mathbf{b}_q \\
        \end{bmatrix}.
```

This can be more concisely written as $C_{ij} = (\mathbf{a}^\top)_i\mathbf{b}_j,~\forall i=1,\ldots,m,~j=1,\ldots,q$.

2.  **Matrix-vector products approach (or columnwise product approach).** Let us write the same matrices as $A B = A [\mathbf{b}_1, \mathbf{b}_2, \ldots, \mathbf{b}_q]$. Then the product can be written as a column stack of the individual matrix-vector products.

```{math}
C = A B  = [A\mathbf{b}_1, A\mathbf{b}_2, \ldots, A\mathbf{b}_q].
```

This is particularly convenient in computations because we don't have to store the matrix $B$ in its entirety--we just need to store one column at a time, which is much less storage!

3.  **Rowwise product approach.** Similar to the previous approach, we can also do a rowwise product. Let us write the matrix $A$ in terms of its row vectors: $C = AB = \begin{bmatrix}
            (\mathbf{a}^\top)_1 \\
            \vdots \\
            (\mathbf{a}^\top)_m
        \end{bmatrix}  B$. Then,

```{math}
C = A B = \begin{bmatrix}
            (\mathbf{a}^\top)_1  B \\
            (\mathbf{a}^\top)_2  B \\
            \vdots \\
            (\mathbf{a}^\top)_m  B \\
        \end{bmatrix}.
```

This approach has the same benefits as the previous one.

##### Matrix Products Are Just Linear Transformations

It is useful to see the matrix product as a column stack of matrix-vector products, i.e., approach 2 above. So let's look at a single matrix-vector product. Let $A=\begin{bmatrix}
        1 & 0 \\
        1 & 1
    \end{bmatrix}$ and $\mathbf{b}_1 = \begin{bmatrix}
        1 \\
        1
    \end{bmatrix}$. Then, the matrix-vector product

```{math}
A \mathbf{b}_1 = \begin{bmatrix}
        1 \times \begin{bmatrix}
        1 \\
        1
    \end{bmatrix} + 1 \times \begin{bmatrix}
        0 \\
        1
    \end{bmatrix}
    \end{bmatrix} = \begin{bmatrix}
        1 \\
        2
    \end{bmatrix}.
```

Crucially, the matrix $A$ *transformed* the vector $\mathbf{b}_1 = \begin{bmatrix}
        1 \\
        1
    \end{bmatrix}$ into the vector $\begin{bmatrix}
        1 \\
        2
    \end{bmatrix}$. We call this transformation a *linear* transformation because matrix multiplication defines maps that preserve vector addition and scalar multiplication. Geometrically, these maps can produce effects such as *scaling*, *rotations*, *reflections*, and *shears*. In this specific example, the vector $\mathbf{b}_1$ has been *rotated counterclockwise and scaled* by the matrix-vector product, as shown in the figures below.

```{figure} ../pics/M1_linear_transform.png
:name: fig-linear-transform
:width: 70%
:align: center

Linear transformation of a vector $\mathbf{b}$ by the matrix $A$.
```

```{figure} ../pics/M1_detA0.png
:name: fig-det-a-zero
:width: 70%
:align: center

Degenerate linear transformation with zero determinant.
```

Therefore, in summary, matrix products are linear transforms! In the matrix product $C=AB$, every column of $B$ is linearly transformed by the matrix $A$.

##### Some Matrix Product Properties

- Matrix product is NOT commutative. So, $AB \neq BA$. This should make sense if you apply the linear transformation interpretation described above (think about what is being linearly transformed in $AB$ as opposed to $BA$).

- The product of a matrix with an identity matrix is the matrix itself: $A  I = A$. Check this yourself!

- The multiplication of a matrix with its transpose is always symmetric: $(A  A^\top)^\top = A  A^\top.$





## Solving Linear Systems

Consider a linear system

$$
A\mathbf{x}=\mathbf{b},
$$

where $A$ is the coefficient matrix, $\mathbf{x}$ is the unknown vector, and $\mathbf{b}$ is the right-hand-side vector. If $A^{-1}$ exists, then

$$
\mathbf{x}=A^{-1}\mathbf{b}.
$$

Given $A$ and $\mathbf{b}$, several scenarios are possible:

- a solution may not exist;
- solutions may exist but not be unique (there may be infinitely many);
- for a homogeneous system, $\mathbf{b}=\mathbf{0}$, the trivial solution $\mathbf{x}=\mathbf{0}$ is always present;
- a solution may exist and be unique.

### The First Examples

#### Example: a system with no solution

Consider

$$
\begin{aligned}
x_1+x_2 &= 1,\\
x_1+x_2 &= 0.
\end{aligned}
$$

The two lines are parallel and do not intersect, so the system has no solution.

```{figure} ../pics/M1_linear_system_no_solution.png
:name: fig-linear-system-no-solution
:width: 55%
:align: center

Two parallel equations representing a linear system with no solution.
```

#### Solving an upper-triangular system by back substitution

Suppose

```{math}
\begin{bmatrix}
1 & -1 & 1\\
0 & 10 & 25\\
0 & 0 & -95
\end{bmatrix}
\begin{bmatrix}x_1\\ x_2\\ x_3\end{bmatrix}
=
\begin{bmatrix}0\\90\\-190\end{bmatrix}.
```

Because the coefficient matrix is upper triangular, solve from the last equation upward:

$$
\begin{aligned}
-95x_3&=-190 &&\Longrightarrow x_3=2,\\
10x_2+25x_3&=90 &&\Longrightarrow x_2=4,\\
x_1-x_2+x_3&=0 &&\Longrightarrow x_1=2.
\end{aligned}
$$

Thus

$$
\mathbf{x}=\begin{bmatrix}2\\4\\2\end{bmatrix}.
$$

#### Reducing a general system to triangular form

For

$$
\begin{aligned}
2x_1+5x_2&=2,\\
-4x_1+3x_2&=-30,
\end{aligned}
$$

write the augmented matrix

$$
\left[\begin{array}{cc|c}
2&5&2\\
-4&3&-30
\end{array}\right].
$$

Apply the row operation $R_2\leftarrow 2R_1+R_2$:

$$
\left[\begin{array}{cc|c}
2&5&2\\
0&13&-26
\end{array}\right].
$$

Back substitution gives

$$
x_2=-2,\qquad x_1=6.
$$

Three routes for solving $A\mathbf{x}=\mathbf{b}$, when the required conditions hold, are:

1. **Triangularization:** Gaussian elimination or LU decomposition.
2. **Determinants:** Cramer's rule.
3. **Matrix inverse:** Gauss--Jordan elimination.

### LU Decomposition

Assume $A\mathbf{x}=\mathbf{b}$ has a unique solution and write

$$
A=LU,
$$

where $L$ is lower triangular and $U$ is upper triangular. Then

$$
LU\mathbf{x}=\mathbf{b}.
$$

Introduce

$$
U\mathbf{x}=\mathbf{y}.
$$

The solution proceeds in two triangular solves:

$$
\begin{aligned}
L\mathbf{y}&=\mathbf{b} &&\text{(forward substitution)},\\
U\mathbf{x}&=\mathbf{y} &&\text{(back substitution)}.
\end{aligned}
$$

#### LU example

Let

$$
A=\begin{bmatrix}4&3\\6&3\end{bmatrix},
\qquad
\mathbf{b}=\begin{bmatrix}10\\12\end{bmatrix}.
$$

Seek

$$
L=\begin{bmatrix}1&0\\\ell_{21}&1\end{bmatrix},
\qquad
U=\begin{bmatrix}u_{11}&u_{12}\\0&u_{22}\end{bmatrix}.
$$

From $A=LU$,

```{math}
\begin{bmatrix}
u_{11} & u_{12}\\
u_{11}\ell_{21} & u_{12}\ell_{21}+u_{22}
\end{bmatrix}
=
\begin{bmatrix}4&3\\ 6&3\end{bmatrix}.
```

Therefore

$$
u_{11}=4,\qquad u_{12}=3,\qquad \ell_{21}=\frac{3}{2},\qquad u_{22}=-\frac{3}{2},
$$

and

$$
L=\begin{bmatrix}1&0\\\frac32&1\end{bmatrix},
\qquad
U=\begin{bmatrix}4&3\\0&-\frac32\end{bmatrix}.
$$

First solve

```{math}
\begin{bmatrix}1&0\\\frac32&1\end{bmatrix}
\begin{bmatrix}y_1\\y_2\end{bmatrix}
=
\begin{bmatrix}10\\12\end{bmatrix},
```

which gives

$$
y_1=10,\qquad y_2=-3,
\qquad
\mathbf{y}=\begin{bmatrix}10\\-3\end{bmatrix}.
$$

Then solve

```{math}
\begin{bmatrix}4&3\\0&-\frac32\end{bmatrix}
\begin{bmatrix}x_1\\x_2\end{bmatrix}
=
\begin{bmatrix}10\\-3\end{bmatrix},
```

which gives

$$
x_2=2,\qquad x_1=1,
\qquad
\boxed{\mathbf{x}=\begin{bmatrix}1\\2\end{bmatrix}}.
$$

#### A second elimination setup

Consider

$$
\begin{aligned}
x_1-x_2+x_3&=0,\\
-x_1+x_2-x_3&=0,\\
10x_2+25x_3&=90,\\
20x_1+10x_2&=80.
\end{aligned}
$$

The second equation is redundant with the first, so it can be removed. This gives

$$
A=\begin{bmatrix}
1&-1&1\\
0&10&25\\
20&10&0
\end{bmatrix},
\qquad
\mathbf{b}=\begin{bmatrix}0\\90\\80\end{bmatrix}.
$$

Starting from the augmented matrix, the row operation

$$
R_3\leftarrow R_3-20R_1
$$

produces

$$
\left[\begin{array}{ccc|c}
1&-1&1&0\\
0&10&25&90\\
0&30&-20&80
\end{array}\right].
$$

Continue the elimination as an exercise.

### Determinants


#### Definitions

The determinant is a property of a *square* matrix and is a scalar value. The determinant measures the factor by which an area (volume in higher dimensions) is scaled due to a linear transformation with the matrix. It is hard (and somewhat useless) to give a generic formula for a matrix determinant. But the following illustration for a $2\times 2$ and $3\times 3$ matrix is illuminating.

- Let $A = \begin{bmatrix}
          a & b\\
          c & d
      \end{bmatrix}$. Then, the determinant of $A$: $\det(A) = ad-bc$.

- Let $A = \begin{bmatrix}
          a & b & c\\
          d & e & f\\
          g & h & i
      \end{bmatrix}$. Then, the determinant of $A$:

```{math}
\begin{split}
      \det(A) =& a\times \det \left( \begin{bmatrix}
          e & f \\
          h & i
      \end{bmatrix}\right) - b\times \det \left( \begin{bmatrix}
          d & f \\
          g & i
      \end{bmatrix}\right) + c\times \det \left( \begin{bmatrix}
          d & e \\
          g & h
      \end{bmatrix}\right) \\
       =& a(ei - fh) - b(di - fg) + c(dh-eg)
      \end{split}
```

In the expression above, you will notice two things.

  - Firstly, every element of the first row of $A$ is multiplied by the determinant of a sub-matrix (smaller matrix). This matrix is called a *minor*. The minor of element $A_{ij}$ is the matrix that results from deleting the $i$th row and $j$th column of $A$. Therefore, the minor of $A_{11}=a$ is the matrix $\begin{bmatrix}
            e & f \\
            h & i
        \end{bmatrix}$.

  - Secondly, the sign of each term in the expression above alternates in a checkerboard pattern: $+-+$.

- For matrices of shape larger than $3 \times 3$, the principle used for the $3\times 3$ example above can be applied *recursively*. However, we will see that such an approach is not necessary and more efficient approaches exist.



#### Examples of determinant calculation

For

$$
A=\begin{bmatrix}1&2\\2&6\end{bmatrix},
$$

$$
\det(A)=1\cdot 6-2\cdot 2=2.
$$

For the $3\times 3$ matrix

$$
A=\begin{bmatrix}
1&0&1\\
1&2&1\\
-1&0&2
\end{bmatrix},
$$

expansion along the first row gives

$$
\begin{aligned}
\det(A)
&=1\det\begin{bmatrix}2&1\\0&2\end{bmatrix}
-0\det\begin{bmatrix}1&1\\-1&2\end{bmatrix}
+1\det\begin{bmatrix}1&2\\-1&0\end{bmatrix}\\
&=4+2=6.
\end{aligned}
$$

For higher-dimensional matrices, the same cofactor-expansion idea can be applied recursively.

#### Geometric interpretation

Let

$$
A=\begin{bmatrix}1&0\\0&2\end{bmatrix},
\qquad
\mathbf{x}=\begin{bmatrix}1\\1\end{bmatrix}.
$$

Then

$$
A\mathbf{x}=\begin{bmatrix}1\\2\end{bmatrix},
\qquad
\det(A)=2.
$$

In two dimensions, a triangle of area $\tfrac12$ is mapped to one of area $1$. Thus the area is scaled by a factor of $2$, matching $|\det(A)|$.

```{figure} ../pics/M1_determinant_area_scaling.png
:name: fig-determinant-area-scaling
:width: 55%
:align: center

Geometric interpretation of the determinant as an area-scaling factor.
```



### Some properties of matrix determinants

1.  If any row (or column) of a matrix $A$ is all $0$'s, then $\det(A)=0$. This means, a linear transformation by the matrix $A$ would shrink an area (or volume) to $0$! Check this yourself!

2.  If any row (or column) of matrix $A$ is a scalar multiple of another, then $\det(A)=0$. For example,

   $$
   \begin{bmatrix}1&3\\2&6\end{bmatrix}
   $$

   has linearly dependent columns.

3.  Let $A \in \mathbb{R}^{n\times n}$. Then, $\det(k A) = k^n \det(A)$.  Specifically, for $A=\begin{bmatrix}a&b\\c&d\end{bmatrix}$,

   $$
   \det(kA)=k^2(ad-bc).
   $$

4.  Let $A, B \in \mathbb{R}^{n\times n}$. Then, $\det(AB) = \det(A)\det(B)$.

5.  Transposition does not change determinant: $\det(A) = \det(A^\top)$.

6.  **Triangular matrix.** The determinant of a triangular matrix is the product of its diagonal elements: Let $A = \begin{bmatrix}
            a & b & c\\
            0 & e & f\\
            0 & 0 & i
        \end{bmatrix}$, then $\det(A) = a\times e \times i$. Therefore, one of the common ways of finding determinant of a general $n\times n$ matrix is to first reduce it to triangular form and then use the formula above.

7.  **Diagonal matrix.** The determinant of a diagonal matrix is the product of its diagonal elements: Let $A = \begin{bmatrix}
            a & 0 & 0\\
            0 & e & 0\\
            0 & 0 & i
        \end{bmatrix}$, then $\det(A) = a\times e \times i$.
    Particularly, this means for an identity matrix $I$, $\det(I) = 1$.

8. If $A^{-1}$ exists,

   $$
   \det(A^{-1})=\frac{1}{\det(A)}.
   $$

   (This is a composition of two properties above.)

9.  **Orthogonal matrix.** The determinant of an orthogonal matrix $A$ is $\pm1$.

10.  **$A\mathbf{x}=\mathbf{0}$.** Let there be a vector $\mathbf{x} \neq \mathbf{0}$ (so $\mathbf{x}$ is not all $0$'s), and $A$ is also not all $0$'s. Then, the only way $A\mathbf{x}=\mathbf{0}$ is if $\det(A) = 0$! We will see this applied in the next section.


### Cramer's Rule

For the linear system

$$
A\mathbf{x}=\mathbf{b},
$$

where $A$ is $n\times n$ and $\det(A)\neq 0$, Cramer's rule gives

$$
x_k=\frac{\det(A_k)}{\det(A)},
\qquad k=1,\ldots,n,
$$

where $A_k$ is obtained by replacing the $k$-th column of $A$ with $\mathbf{b}$.

#### Example

Consider

$$
\begin{aligned}
4x_1+3x_2&=12,\\
2x_1+5x_2&=-8.
\end{aligned}
$$

Then

$$
A=\begin{bmatrix}4&3\\2&5\end{bmatrix},
\qquad
\mathbf{b}=\begin{bmatrix}12\\-8\end{bmatrix},
$$

with

$$
A_1=\begin{bmatrix}12&3\\-8&5\end{bmatrix},
\qquad
A_2=\begin{bmatrix}4&12\\2&-8\end{bmatrix}.
$$

The determinants are

$$
\det(A)=14,\qquad
\det(A_1)=84,\qquad
\det(A_2)=-56.
$$

Hence

$$
x_1=\frac{84}{14}=6,
\qquad
x_2=\frac{-56}{14}=-4,
$$

and

$$
\boxed{\mathbf{x}=\begin{bmatrix}6\\-4\end{bmatrix}}.
$$

Cramer's rule is simple in structure, but it is not the most computationally efficient approach.

### Linear Independence of Rows and Columns

Linear independence has a direct consequence for the existence and uniqueness of solutions to $A\mathbf{x}=\mathbf{b}$.

Let $A$ be an $n\times n$ matrix with columns

$$
A=\begin{bmatrix}\mathbf{a}_1&\mathbf{a}_2&\cdots&\mathbf{a}_n\end{bmatrix}.
$$

The columns are linearly independent if

$$
\alpha_1\mathbf{a}_1+\alpha_2\mathbf{a}_2+\cdots+\alpha_n \mathbf{a}_n=\mathbf{0}
$$

only when

$$
\alpha_1=\alpha_2=\cdots=\alpha_n=0.
$$

Equivalently,

$$
A\boldsymbol{\alpha}=\mathbf{0}
$$

has only the trivial solution. The same definition applies to the rows of $A$.

If a homogeneous system

$$
A\mathbf{x}=\mathbf{0}
$$

has a nonzero solution $\mathbf{x}\neq\mathbf{0}$, then the columns of $A$ are linearly dependent and $\det(A)=0$. For a square matrix, this corresponds to a singular matrix, so $A\mathbf{x}=\mathbf{b}$ does not have a unique solution for every $\mathbf{b}$.

#### Examples

For

$$
A=\begin{bmatrix}1&1\\-1&-1\end{bmatrix},
$$

the rows satisfy

$$
1\begin{bmatrix}1&1\end{bmatrix}
+1\begin{bmatrix}-1&-1\end{bmatrix}
=\begin{bmatrix}0&0\end{bmatrix},
$$

so the rows are linearly dependent.

For

$$
A=\begin{bmatrix}
1&2&4\\
2&1&5\\
1&1&3
\end{bmatrix},
$$

the third column satisfies

$$
A_3=2A_1+A_2,
$$

so the columns are linearly dependent and $\det(A)=0$.

### Solving via the Matrix Inverse

Let $A$ be $n\times n$. A matrix $B$ is the inverse of $A$ if

$$
AB=I,
$$

and we write $B=A^{-1}$. If $A\mathbf{x}=\mathbf{b}$ has a unique solution, then

$$
\mathbf{x}=A^{-1}\mathbf{b}.
$$

#### Gauss--Jordan elimination

Starting from

$$
A\mathbf{x}=\mathbf{b},
$$

left-multiplication by $A^{-1}$ gives

$$
A^{-1}A\mathbf{x}=A^{-1}\mathbf{b},
$$

so

$$
\mathbf{x}=A^{-1}\mathbf{b}.
$$

Gauss--Jordan elimination applies row operations to the augmented matrix

$$
\left[\begin{array}{c|c}A&\mathbf{b}\end{array}\right]
$$

until the left block becomes $I$. The right block then becomes the solution $\mathbf{x}$.

#### Example

Use

$$
\left[\begin{array}{cc|c}
4&3&10\\
6&3&12
\end{array}\right].
$$

First,

$$
R_2\leftarrow \frac{3}{2}R_1-R_2,
$$

which gives

$$
\left[\begin{array}{cc|c}
4&3&10\\
0&\frac32&3
\end{array}\right].
$$

Next,

$$
R_1\leftarrow R_1-2R_2,
$$

which gives

$$
\left[\begin{array}{cc|c}
4&0&4\\
0&\frac32&3
\end{array}\right].
$$

Finally scale the rows:

$$
R_1\leftarrow \frac14R_1,
\qquad
R_2\leftarrow \frac{1}{3/2}R_2.
$$

Then

$$
\left[\begin{array}{cc|c}
1&0&1\\
0&1&2
\end{array}\right],
$$

so

$$
\boxed{\mathbf{x}=\begin{bmatrix}1\\2\end{bmatrix}}.
$$

#### Computing the inverse from linear systems

If

$$
B=A^{-1}
=\begin{bmatrix}\mathbf{b}_1&\mathbf{b}_2&\cdots&\mathbf{b}_n\end{bmatrix},
$$

then

$$
AB=I
=\begin{bmatrix}\mathbf{e}_1&\mathbf{e}_2&\cdots&\mathbf{e}_n\end{bmatrix},
$$

so the columns of $B$ are found from the $n$ linear systems

$$
A\mathbf{b}_1=\mathbf{e}_1,\qquad
A\mathbf{b}_2=\mathbf{e}_2,\qquad \ldots,\qquad
A\mathbf{b}_n=\mathbf{e}_n.
$$

Repeated Gaussian elimination requires repeated triangularization because the right-hand sides differ, whereas an LU decomposition of $A$ can be computed once and reused for all right-hand sides.

## Eigenvalue Problems


The eigenvalue problem solves $A\mathbf{x}=\lambda \mathbf{x}$, where $A$ is a square matrix, $\mathbf{x}$ is called the eigenvector of $A$ and $\lambda$ is called the eigenvalue of $A$. Geometrically, the eigenvalue problem seeks to find the vector $\mathbf{x}$ which is un-rotated by a linear transformation with $A$ but is scaled by the scalar $\lambda$ (eigenvalue). The eigenvector can be interpreted as a *principal axis* of the matrix $A$. It finds widespread applications but we will not go into them here.


### Eigenvalues and eigenvectors

For an $n\times n$ matrix $A$, a nonzero vector $\mathbf{x}$ is an eigenvector if

$$
A\mathbf{x}=\lambda\mathbf{x},
$$

where $\lambda$ is the corresponding eigenvalue. Geometrically, an eigenvector is a direction that is only scaled, and possibly reversed, by the linear transformation.

```{figure} ../pics/M1_eigenvector_geometry.png
:name: fig-eigenvector-geometry
:width: 55%
:align: center

An eigenvector retains its direction under the linear transformation and is scaled by its eigenvalue.
```

If $\mathbf{x}$ is an eigenvector, any nonzero scalar multiple of $\mathbf{x}$ is also an eigenvector with the same eigenvalue.

### Example

Let

$$
A=\begin{bmatrix}6&3\\4&7\end{bmatrix},
\qquad
\mathbf{x}=\begin{bmatrix}3\\4\end{bmatrix}.
$$

Then

$$
A\mathbf{x}
=\begin{bmatrix}30\\40\end{bmatrix}
=10\begin{bmatrix}3\\4\end{bmatrix},
$$

so $\mathbf{x}$ is an eigenvector and $\lambda=10$. The vector

$$
\begin{bmatrix}6\\8\end{bmatrix}
=2\begin{bmatrix}3\\4\end{bmatrix}
$$

is another eigenvector associated with the same eigenvalue.

### Computing eigenvalues

Starting from

$$
A\mathbf{x}=\lambda\mathbf{x},
$$

write

$$
\begin{aligned}
A\mathbf{x}&=\lambda I\mathbf{x},\\
(A-\lambda I)\mathbf{x}&=\mathbf{0}.
\end{aligned}
$$

The trivial vector $\mathbf{x}=\mathbf{0}$ always satisfies this equation, but an eigenvector must satisfy $\mathbf{x}\neq\mathbf{0}$. Thus $A-\lambda I$ must be singular, which leads to the characteristic equation

$$
\boxed{\det(A-\lambda I)=0}.
$$

If

$$
A=\begin{bmatrix}A_1&A_2&\cdots&A_n\end{bmatrix}
$$

and $\mathbf{e}_i$ denotes the $i$-th standard basis vector, then

$$
(A-\lambda I)\mathbf{x}
=x_1(A_1-\lambda\mathbf{e}_1)+\cdots+x_n(A_n-\lambda\mathbf{e}_n)=\mathbf{0}.
$$

For a nonzero $\mathbf{x}$, these columns must be linearly dependent, again yielding $\det(A-\lambda I)=0$.

### Eigenvalue/eigenvector example

Let

$$
A=\begin{bmatrix}-5&2\\2&-2\end{bmatrix}.
$$

Then

$$
A-\lambda I
=\begin{bmatrix}-5-\lambda&2\\2&-2-\lambda\end{bmatrix}.
$$

The characteristic equation is

$$
\begin{aligned}
0&=\det(A-\lambda I)\\
&=(-5-\lambda)(-2-\lambda)-4\\
&=(\lambda+5)(\lambda+2)-4\\
&=\lambda^2+7\lambda+6\\
&=(\lambda+6)(\lambda+1).
\end{aligned}
$$

Therefore

$$
\lambda_1=-6,\qquad \lambda_2=-1.
$$

For $\lambda=-6$, solve

$$
A\mathbf{x}=-6\mathbf{x}.
$$

The equations reduce to

$$
x_1+2x_2=0.
$$

Choose $x_1=1$, which gives $x_2=-\tfrac12$. One eigenvector is

$$
\boxed{\mathbf{x}_{-6}=\begin{bmatrix}1\\-\frac12\end{bmatrix}}.
$$

For $\lambda=-1$, the equations reduce to

$$
2x_1-x_2=0.
$$

Choose $x_2=1$, which gives $x_1=\tfrac12$. One eigenvector is

$$
\boxed{\mathbf{x}_{-1}=\begin{bmatrix}\frac12\\1\end{bmatrix}}.
$$



### Some properties of matrix eigenvalues and eigenvectors

1.  The eigenvalues of a square matrix can be real, complex or a mix of both, even if the matrix is real valued.

2.  A square matrix $A$ has at least 1 unique eigenvalue; it can have up to $n$ unique eigenvalues.

3.  The eigenvalues of a matrix $A$ are called its *spectrum*. The eigenvalue with largest absolute magnitude is called the *spectral radius*.

4.  The eigenvectors of a matrix are not unique. If $\mathbf{x}_1$ and $\mathbf{x}_2$ are linearly independent eigenvectors of $A$ associated with the same eigenvalue, then any non-zero linear combination $k_1\mathbf{x}_1 + k_2 \mathbf{x}_2$ is also an eigenvector of $A$.

5.  The eigenvalues of a diagonal matrix are the diagonal elements.

6.  The eigenvalues of a symmetric matrix are all real.

7.  The eigenvalues of a skew-symmetric matrix are either pure imaginary or zero.

8.  The eigenvalues of an orthogonal matrix are either real or complex. When they are complex, they occur as a complex-conjugate pair ($a\pm ib$) and always have their absolute value $=1$: $\sqrt{a^2 + b^2}=1$.





## Summary

By now you should be able to:

+ Comfortably interpret linear algebra notations.
+ Interpret basic matrix operations, e.g. matrix multiplication, and dot products.
+ Perform matrix operations and compute properties, e.g., matrix determinants, multiplication, and inverse.
+ Concerning eigenvalue problems:
  - Interpret and eigenvalue problem, eigenvalues and eigenvectors.
  - Compute the eigenvalues and eigenvectors.
  - Use the eigenvalues and eigenvectors to solve system of ODE's.

Also, by now you are prepared to learn methods to numerically solve PDE systems in the later chapters.
