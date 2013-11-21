#!/usr/bin/env python
import json
import sqlite3
import logging

from bottle import request, route, run, template
from bottle import static_file


# Database to open/connect to
DB = "sample.db"

log = logging.getLogger("siqqel")

@route('/siqqel/passthru.php')
def index():
    query = json.loads(request.query.sql)
    log.debug("input query: %s", query)
    db = sqlite3.connect(DB)
    sql = query["SQL"]

    # Substitute hash params
    if "hashParams" in query:
        for var, val in query["hashParams"].iteritems():
            sql = sql.replace("#" + var, val)

    log.debug("SQL after substs: %s", sql)
    res = {}
    try:
        cursor = db.cursor()
        cursor.execute(sql)
    except sqlite3.OperationalError, e:
        log.exception("SQL error")
        res["MYSQL_ERROR"] = str(e)
        res["MYSQL_ERRNO"] = 1
        out = request.query.callback + "(" + json.dumps(res) + ")"
        log.debug(out)
        return out

    res["HEADER"] = [x[0] for x in cursor.description]
    res["TYPES"] = ["MYSQLI_TYPE_VAR_STRING"] * len(res["HEADER"])
    res["ROWS"] = cursor.fetchall()
    out = request.query.callback + "(" + json.dumps({"RESULT": res}) + ")"
    log.debug("result: %s", out)
    return out


@route("/siqqel/<filename:path>")
def server_static(filename):
    return static_file(filename, root="siqqel")


@route("/")
def server_static():
    return static_file("example.html", root=".")


logging.basicConfig(level=logging.DEBUG)
run(host='localhost', port=8080)
