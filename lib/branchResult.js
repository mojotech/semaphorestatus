var colors  = require('colors');
var moment  = require('moment');

exports.print = function (data) {
  if (data.commit) {
    if (data.result == 'pending') {
      return String("PENDING" + " " + data.branch_name).cyan.inverse + " "+
              "pushed " + moment(data.commit.timestamp).fromNow().yellow +
              "\n  "+ data.commit.message.replace("\n", " ") +"\n  " +
              data.build_url.underline;
    }
    else if (data.result == 'failed') {
      return String("☹" + " " + data.branch_name).red.inverse + " " +
              moment(data.finished_at).fromNow().yellow +
              "\n  "+ data.commit.message.replace("\n", " ") +"\n  " +
              data.build_url.underline;
    }
    return String("✔" + " " + data.branch_name).green.inverse + " " +
            moment(data.finished_at).fromNow().yellow +
            "\n  "+ data.commit.message.replace("\n", " ") +"\n  " +
            data.commit.url.underline;
  }
}