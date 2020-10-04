import React, { Component } from "react";
import $ from "jquery";
import "./styles.css";
import moment from "moment";

moment.locale("de");

export default class App extends Component {
  constructor() {
    super();
    this.state = { posts: [], media: {} };
    this.updatePosts();
  }

  componentDidMount() {
    this.updatePosts();
  }

  updatePosts = () => {
    const that = this;
    $.getJSON(
      "https://katharineum-zu-luebeck.de/wp-json/wp/v2/posts/?categories=1"
    )
      .done(function (data) {
        let posts = data.map(function (post) {
          post.date = moment(post.date);
          return post;
        });
        that.setState({ posts: data });
        for (let [i, post] of posts.entries()) {
          console.log(i, post);
          if (
            post._links["wp:featuredmedia"] &&
            post._links["wp:featuredmedia"].length > 0
          ) {
            let mediaURL = post._links["wp:featuredmedia"][0].href;
            $.getJSON(mediaURL).done(function (data) {
              const mediaURL = data["source_url"];
              console.log(mediaURL);
              let oldMedia = that.state.media || {};
              oldMedia[post.id] = mediaURL;
              that.setState({ media: oldMedia });
            });
            console.log(mediaURL);
          }
        }

        //console.log(data);
        //window.setTimeout(that.updatePosts, 10000);
      })
      .fail(function () {
        // window.setTimeout(that.updatePosts, 1000);
      });
  };
  render() {
    const that = this;
    return (
      <section className="App sheet">
        {this.state.posts.map(function (post) {
          return (
            <div className="post">
              <h1 dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
              <p className="date">{post.date.format("DD.MM.YYYY")}</p>
              <img
                src={
                  that.state.media.hasOwnProperty(post.id)
                    ? that.state.media[post.id]
                    : ""
                }
                className="post-image"
                alt={"Post"}
              />
              <div
                className="content"
                dangerouslySetInnerHTML={{ __html: post.content.rendered }}
              />
            </div>
          );
        })}
      </section>
    );
  }
}
