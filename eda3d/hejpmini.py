#from __future__ import division
from print_schema import *
import os
from flask import Flask
from flask import Markup
from flask import redirect
from flask import Blueprint,render_template, abort
from flask import request
from jinja2 import TemplateNotFound
import psycopg2
import timeit
import json

"""
from collections import OrderedDict
from query import *
from fieldValues import *
from occupations import occupations
from nsfFields import *
from parse import *
from skillField import *
import pandas as pd
import numpy as np
from collections import Counter
from calculate import *
""" 
project_dir = os.path.dirname(os.path.abspath(__file__))


app = Flask(__name__,
            static_url_path='',
            static_folder='static')


@app.route('/',methods=["GET"])
def home():
    return render_template("homemini.html")

@app.route('/test',methods=["GET"])
def test():
    result = queryAll("Select * from maintable limit 5")
    return render_template("test.html",result=result)

@app.route('/demo1',methods=["GET"])
def demo1():
    result = queryAll(
  """Select job_type,institution_type,count(*)
     from maintable group by year,job_type,institution_type
  """)
    return render_template("test.html",result=result)

@app.route('/demo2',methods=["GET"])
def demo2():
    result = queryAll("""select
     maintable.year,
     concat(isresearch1institution,fouryear,twoyear) as yr,
     concat(faculty,postdoctoral) as staff,
      concat(fs_lifesciences,fs_physicalsciencesandearthsciences,fs_mathematicsandcomputersciences,
            fs_psychologyandsocialsciences,fs_engineering,fs_education,fs_humanitiesandarts,fs_others) as fs,
     count(*) as n
 from maintable,nsftable
 where maintable.jobid=nsftable.jobid
 group by yr,staff,fs,maintable.year order by maintable.year,yr,staff,fs;
""")
    return render_template("test.html",result=result)    

@app.route('/demo3',methods=["GET"])
def demo3():
    result = queryAll("""select
     concat(isresearch1institution,fouryear,twoyear) as yr,
     concat(faculty,postdoctoral) as staff,
     count(*) as n
 from maintable,nsftable
 where maintable.jobid=nsftable.jobid
 group by yr,staff order by yr,staff;
""")
    with open("static/demo3.json","w") as outfile:
        json.dump(result,outfile)
    return render_template("test.html",result=result)    


@app.route('/demo4',methods=["GET"])
def demo4():
    result = queryAll("""select
     maintable.year,
     concat(isresearch1institution,fouryear,twoyear) as yr,
     concat(faculty,postdoctoral) as staff,
     concat(fs_lifesciences,fs_physicalsciencesandearthsciences,fs_mathematicsandcomputersciences,
            fs_psychologyandsocialsciences,fs_engineering,fs_education,fs_humanitiesandarts,fs_others) as fs,
     count(*) as n
 from maintable,nsftable
 where maintable.jobid=nsftable.jobid
 group by maintable.year,yr,staff,fs order by maintable.year,yr,staff,fs;
""")
    with open("static/demo4.json","w") as outfile:
        json.dump(result,outfile)
    return render_template("test.html",result=[['done'],[len(result)]])    
@app.route('/demo4a',methods=["GET"])
def demo4a():
    with open("static/demo4.json","r") as infile:
        result = json.load(infile)
    print(len(result))
    data = processData(result)
    with open("static/dataN.json","w") as outfile:
        json.dump(data,outfile)
    return render_template("test.html",result=[[len(result)]])

@app.route('/about',methods=["GET"])
def about():
    return render_template("about.html")



@app.route('/demo_3d',methods=["GET"])
def demo_3d():
    return render_template("demo_3d.html")

def processData(result):
    """ this converts a list as returned by the postgres query into the form expected by hejp3d 
        and stores it in the static folder  
    """
    inst_r1 = [x for x in result if x[1]=='110'] # r1 institutions
    inst_4y = [x for x in result if x[1]=='010'] # 4 year, non-r1 institutions
    inst_2y = [x for x in result if x[1]=='001'] # 2 year institutions
    inst_all = [x for x in result if x[1] in ['001','010','110']] # 2 year institutions
    data = [processStaff(inst_r1,'R1 Universities'),
            processStaff(inst_4y,'4-Year Universities'),
            processStaff(inst_2y,'2-Year Universities'),
            processStaff(inst_all,'all')
    ]
    return(data)

def processStaff(result,inst):
    """ forms list of dictionaries on years, wrt staff type (faculty, non-faculty, postdoc) """
    staff_fac = [x for x in result if x[2]=='10'] # faculty
    staff_pd = [x for x in result if x[2]=='01'] # postdocs
    staff_nonfac = [x for x in result if x[2]=='00'] # non-faculty
    data = [processYears(staff_fac,inst,'faculty'),
            processYears(staff_nonfac,inst,'non_faculty'),
            processYears(staff_pd,inst,'post_doc')]
    return(data)

def processYears(result,inst,staff):
    """ forms a dictionary with years as keys giving data for all of the fields of study """
    data = {year:processFSdict(result,inst,staff,year) for year in [2007]+list(range(2010,2018))}
    return data

def processFSdict(result,inst,staff,year):
    """ returns a dictionary with the field of study counts for each institution_type, job_type, and year
    """
    data =  {"year":year,
             "institution_type":inst,
             "job_type":staff,
             "FS_Life_sciences":processFS(result,0),
             "FS_Physical_sciences_and_earth_sciences":processFS(result,1),
             "FS_Mathematics_and_computer_sciences":processFS(result,2),
             "FS_Psychology_and_social_sciences":processFS(result,3),
             "FS_Engineering":processFS(result,4),
             "FS_Education":processFS(result,5),
             "FS_Humanities_and_arts":processFS(result,6),
             "FS_Others":processFS(result,7),
             "Total":sum([x[4] for x in result])
            }
    return(data)

def processFS(result,pos):
    return(sum([x[4] for x in result if x[3][pos]=="1"]))





def queryAll(query):
    " Connect to the PostgreSQL database server "
    conn = None
    result = None
    try:
        # read connection parameters
        # conn_string = "host='localhost' dbname='HEJP' user='postgres' password='a12s34d56'"
        # conn_string = "dbname='hejp' user='tim' password='none'"
        conn_string = "dbname='hejp' password='none'"
        #conn_string = "dbname='hejp' user='tim' password='HeJp19-20zz!!**'"


        # connect to the PostgreSQL server
        print('Connecting to the PostgreSQL database...')
        conn = psycopg2.connect(conn_string)

        # create a cursor
        cur = conn.cursor()

 # execute a statement
        cur.execute(query)

        # display the PostgreSQL database server version
        result = cur.fetchall()
        # print(result)

     # close the communication with the PostgreSQL
        cur.close()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        if conn is not None:
            conn.close()
            print('Database connection closed.')
        return result



if __name__ == "__main__":
    # app.run(debug=True)
    app.run(host="turing.cs-i.brandeis.edu",port=7000,debug=False)
