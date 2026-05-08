# \# Spreadsheet Engine with Formula Evaluation

# 

# A React-based 10×10 spreadsheet grid with formula evaluation, dependency updates, and circular reference detection.

# 

# \## Features

# 

# \- 10×10 editable spreadsheet grid

# \- Columns A–J and rows 1–10

# \- Direct numeric and text entry

# \- Formula support using `=`

# \- Cell references like `A1`, `B2`, `J10`

# \- Arithmetic support: `+`, `-`, `\*`, `/`

# \- Parentheses support

# \- Automatic recalculation when referenced cells change

# \- Circular reference detection

# \- Invalid formula error handling

# 

# \## Examples

# 

# A1 = 5  

# B1 = =A1+3  

# C1 = =B1\*2

# 

# Output:

# 

# B1 = 8  

# C1 = 16

# 

# Circular reference example:

# 

# A2 = =B2  

# B2 = =A2

# 

# Output:

# 

# \#CIRCULAR

# 

# Invalid formula example:

# 

# C3 = =A1+

# 

# Output:

# 

# \#ERROR

# 

# \## Installation

# 

# ```bash

# npm install

