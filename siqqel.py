#!/usr/bin/env python
import json
import logging
import datetime

from bottle import request, route, run, template
from bottle import static_file


log = logging.getLogger("siqqel")


def db_connect_sqlite3():
    import sqlite3
    db = sqlite3.connect("sample.db")
    return db

def db_connect_pgsql():
    import psycopg2
    return psycopg2.connect("dbname=db user=username")

#db_connect = db_connect_pgsql
db_connect = db_connect_sqlite3


class DatetimeEncoder(json.JSONEncoder):
     def default(self, obj):
         if isinstance(obj, datetime.datetime):
             return str(obj)
         if isinstance(obj, datetime.timedelta):
             return str(obj)
         return json.JSONEncoder.default(self, obj)


@route('/siqqel/passthru.php')
def index():
    query = json.loads(request.query.sql)
    log.debug("input query: %s", query)
    db = db_connect()
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
    except Exception, e:
        log.exception("SQL error")
        res["MYSQL_ERROR"] = str(e)
        res["MYSQL_ERRNO"] = 1
        out = request.query.callback + "(" + json.dumps(res) + ")"
        log.debug(out)
        return out

    res["HEADER"] = [x[0] for x in cursor.description]
    res["TYPES"] = ["MYSQLI_TYPE_VAR_STRING"] * len(res["HEADER"])
    res["ROWS"] = cursor.fetchall()
    out = request.query.callback + "(" + json.dumps({"RESULT": res}, cls=DatetimeEncoder) + ")"
    log.debug("result: %s", out)
    return out


@route("/siqqel/<filename:path>")
def server_static(filename):
    return static_file(filename, root="siqqel")


@route("/")
def server_static():
    return static_file("example.html", root=".")

@route("/page/<filename:path>")
def server_static(filename):
    return static_file(filename, root="html")


logging.basicConfig(level=logging.DEBUG)
run(host='localhost', port=8080)
