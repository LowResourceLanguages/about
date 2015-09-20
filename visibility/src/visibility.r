# LRL visibility study

# ---- loadData ----
longitudinal_visibility <- read.csv("longitudinal_visibility.csv")

# ---- describeData ----
dim(longitudinal_visibility)

object.size(longitudinal_visibility) # Size of longitudinal_visibility in bytes
names(longitudinal_visibility) # columns
summary(longitudinal_visibility)
str(longitudinal_visibility)

# ---- viewHistograms ----
hist(longitudinal_visibility$size)
hist(longitudinal_visibility$stargazers_count)
hist(longitudinal_visibility$subscribers_count)
hist(longitudinal_visibility$open_issues_count)
hist(longitudinal_visibility$forks)

# ---- viewScatterplots ----
plot(c(longitudinal_visibility$size, longitudinal_visibility$stargazers_count), xlab="Size", ylab="Stars")
plot(c(longitudinal_visibility$forks, longitudinal_visibility$stargazers_count), xlab="Forks", ylab="Stars")

