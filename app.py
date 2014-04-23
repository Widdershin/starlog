import arrow
from collections import namedtuple
from operator import attrgetter
from flask import Flask, render_template
import json
from path import path
import re

app = Flask(__name__)

LogLine = namedtuple("LogLine", ["timestamp", "text"])
Stream = namedtuple("Stream", ["name", "lines"])


LOG_DIR = \
    r"C:\workspaces\Workspaces\60957 - BeeJay jadloadb disappears"
    #r"C:\workspaces\Workspaces\61202 - Joel Langley Thinclient Disconnects"
    #r"C:\workspaces\Workspaces\61160 - Hiren Thinclient Connection\JADE_61160"
    #r"C:\Jade\6309-a64\logs"
    #r"C:\workspaces\Workspaces\61189 - JGS Fatclient"

JOMMSG_REGEX = r"([\d\/]+ [\d:\.]+) (.*)"
JOMMSG_FORMAT = "YYYY/MM/DD HH:mm:ss.SSS"


def get_timestamp(datetime):
    return int("{}{}".format(datetime.timestamp, datetime.format("SSS")))


def load_streams(directory, streams, timestamp_regex, timestamp_format):
    return {glob: load_log_stream(
            directory, glob, timestamp_regex, timestamp_format)
            for glob in streams}


def load_log_stream(directory, glob, timestamp_regex, timestamp_format):
    lines = load_raw_log_stream(directory, glob)
    stream = process_log_stream(
        glob, lines, timestamp_regex, timestamp_format)

    return stream


def load_raw_log_stream(log_directory, log_glob):
    logs_files = path(log_directory).files(log_glob)

    lines = []

    for log_file in sorted(logs_files, key=attrgetter("mtime")):
        with open(log_file, 'r', encoding='utf-16') as open_file:
            lines += filter(None, [line.strip()
                            for line in open_file.readlines()])

    return lines


# def decode_line(obj, encoding='utf-8-sig'):
#     if isinstance(obj, basestring):
#         if not isinstance(obj, unicode):
#             obj = unicode(obj, encoding, errors="ignore")

#     assert type(obj) == unicode
#     return obj


def process_log_stream(name, lines, timestamp_regex, timestamp_format):
    """Processes list of lines into LogLine objects, using timestamp_regex"""
    stream = []

    time_regex = re.compile(timestamp_regex, re.UNICODE)
    for line in lines:
        match = time_regex.match(line)

        if not match:
            timestamp = stream[-1].timestamp
        else:
            raw_timestamp, text = match.groups()
            timestamp = get_timestamp(
                arrow.get(raw_timestamp, timestamp_format))

        stream.append(LogLine(timestamp, text))

    return stream


def get_time_range(streams):
    starting_lines = [stream[0] for stream in streams.values()]
    min_timestamp = min(starting_lines, key=attrgetter("timestamp")).timestamp

    ending_lines = [stream[-1] for stream in streams.values()]
    max_timestamp = max(ending_lines, key=attrgetter("timestamp")).timestamp

    return min_timestamp, max_timestamp


@app.route('/streams')
def get_streams():
    streams = ["jommsg*.log",
               "jomreorg.log"]

    loaded_streams = load_streams(
        LOG_DIR,
        streams,
        JOMMSG_REGEX,
        JOMMSG_FORMAT
    )

    return json.dumps({
        "range": get_time_range(loaded_streams),
        "streams": loaded_streams
    })


@app.route('/')
def main():
    return render_template("main.html")

if __name__ == '__main__':
    app.run(debug=True)
