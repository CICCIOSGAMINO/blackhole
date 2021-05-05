# Contributing to Lite

I'd love for you to contribute and make Lite even better than it is today!
Here are the guidelines we'd like you to follow:

- [Contributing to Project](#contributing-to-project)
  - [General Contributing Guidelines](#general-contributing-guidelines)
  - [Code of Conduct](#code-of-conduct)
  - [Questions](#questions?)
  - [Issues and Bugs](#issues-and-bugs)
  - [Feature or Component Requests](#feature-or-component-requests)
  - [Pull Requests](#pull-requests)
  - [Tips](#tips)
  - [Development Process](#development-process)
    - [Setting up your development environment](#setting-up-your-development-environment)
      ...

## General Contributing Guidelines

This is an open source project that accepts contributions from community members.

Want to contribute? Great!

If you’ve never contributed to an open source project before, take a look at GitHub’s [Contributing to Open Source on GitHub](https://guides.github.com/activities/contributing-to-open-source/) to learn some of the basics.

## Code of Conduct

The Material Components authors value respect and are committed to making the repos and communication channels a safe space for all peoples.

## Questions?

Ask them on [Stack Overflow](http://stackoverflow.com/questions/tagged/project-name) and tag them with `project-name` and the platform (`web`)


## Issues and Bugs

If you find a bug in the source code or a mistake in the documentation, you can help us by
submitting an issue to the GitHub repository for that platform.

Even better: propose a fix with a pull request and link it to the issue!


## Feature or Component Requests

You can request new features that do not change the UX on an existing component by submitting an issue to the GitHub repository for that platform.


## Pull Requests

The best way to make an impact is by creating code submissions called pull requests. Pull requests should be ‘solutions’ to GitHub issues.

To make a pull request:

1. Make sure there’s a GitHub issue for the change you’re proposing.
1. [Fork](https://help.github.com/articles/fork-a-repo/) the repo for the platform your code works in.
1. Write code on a branch in your fork.
1. [Create a pull request](https://help.github.com/articles/creating-a-pull-request/) to merge your branch’s contributions into the corresponding project's repo.
1. The pull request will be reviewed by the community.
1. If the pull request is accepted, the accepting core team member will merge the pull request for you.

### Tips

Pull requests can be hard to review if they try to tackle too many things
at once. Phabricator's "[Writing Reviewable Code](https://secure.phabricator.com/book/phabflavor/article/writing_reviewable_code/)"
provides a set of guidelines that help increase the likelihood of your pull request getting merged.

In short (slightly modified from the original article):

- A pull request should be as small as possible, but no smaller.
- The smallest a pull request can be is a single cohesive idea: don't make pull requests so small that they are meaningless on their own.
- Turn large pull requests into small pull requests by dividing large problems into smaller problems and solving the small problems one at a time.
- Write sensible pull request descriptions.

Our additions:

- A pull request should affect as few components as possible.


## Development Process

We strive to make developing Material Components Web as frictionless as possible, both for ourselves and for our community. This section should get you up and running working on the Project codebase.

### Setting up your development environment

You'll need a recent version of [nodejs](https://nodejs.org/en/) to work on Project. We [test our builds](https://travis-ci.com/....) using both the latest and LTS node versions, so use of one of those is recommended. You can use [nvm](https://github.com/creationix/nvm) to easily install and manage different versions of node on your system.