import pymongo
import certifi
import subprocess
import os
import time

str = "mongodb+srv://Winston:Wrz123456@cluster0.pcxsvue.mongodb.net/?retryWrites=true&w=majority"
try:
    myclient = pymongo.MongoClient(str,tlsCAFile=certifi.where())
except Exception:
    print(Exception.args)

myDb = myclient["test"]

Indexes = myDb["indexes"]
Tester = myDb["testers"]

while True:
    x = Indexes.find({}).sort("id")
    for i in x:
        uploader = Tester.find_one({"_id":i["_uploader"]})
        readRatio = '0.5'
        if i['writeRatio'] == '0':
            readRatio = '1'
        elif i['writeRatio'] == '0.2':
            readRatio = '0.8'
        elif i['writeRatio'] == '0.8':
            readRatio = '0.2'
        elif i['writeRatio'] == '1':
            readRatio = '0'
        if i["Done"]=="flase":
            print("test here")
            # run test here

            # step 1: copy the index and competitor.h file into GRE/src/competitor
            ori_path = '../server/Indexes/'+uploader["email"]+'/'+i['time']+'/'
            new_path = '/home/user/GRE/src/competitor/'

            command = ['cp',
                       ori_path+'/'+i['indexFilename'],
                       new_path+'/'+i['indexFilename']]
            ret = subprocess.run(command,shell=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE,encoding="utf-8",timeout=2)
            if ret.returncode<0:
                print("Error in moving index file with id "+i['Id'])
                os.remove(new_path+'/'+i['indexFilename'])
                continue

            command = ['cp',
                       ori_path+'/'+i['compeditorName'],
                       new_path+'/'+i['compeditorName']]
            ret = subprocess.run(command,shell=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE,encoding="utf-8",timeout=2)
            if ret.returncode<0:
                print("Error in moving ompeditor with id "+i['Id'])
                continue

            # step 2: run testing according to user's choice
            command = ['/GRE/build/microbench',
                       '--keys_file=./data/dataset',
                       '--keys_file_type={binary,text}',
                       '--read='+readRatio+' --insert='+i['writeRatio'],
                       '--operations_num=800000000',
                       '--table_size=-1',
                       '--init_table_ratio=0.5',
                       '--thread_num='+i['Thread'],
                       '--index='+i['indexname']]
            
            if i['Latency']!="None":
                command.append('--latency_sample')
                command.append('--latency_sample_ratio='+i['Latency'])

            if i['rangeQuery']:
                command.append('--scan_ratio=1')
                command.append('--scan_num='+i['range'])

            if i['Zipfian']:
                command.append('--sample_distribution=zipf')

            ret = subprocess.run(command,shell=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE,encoding="utf-8",timeout=10)
            if ret.returncode<0:
                print("Error in testing index with id "+i['Id'])
                os.remove(new_path+'/'+i['indexFilename'])
                os.remove(new_path+'/'+i['compeditorName'])
                continue
        
            # sleep untill output.cse comes out
            while os.path.exists("/home/user/GRE/build.csv"):
                print("waiting for /home/user/GRE/build/output.csv")
                time.sleep(2)

            # step 3: delete the index file, competitor file and, move result file back to origin path
            
            os.remove(new_path+'/'+i['indexFilename'])
            os.remove(new_path+'/'+i['compeditorName'])
            command = ['mv',
                       new_path+'/output.csv',
                       ori_path+'/output.csv']
            ret = subprocess.run(command,shell=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE,encoding="utf-8",timeout=2)
            if ret.returncode<0:
                print("Something Wrong in testing Index with id "+i['Id'])
                os.remove(new_path+'/output.csv')
                continue

            # step 4: update database
            myquery = { "_id": i["_id"] }
            newvalues1 = { "$set": { "Done": "false"}} 
            newvalues2 = {"$set": { "result": "output.csv"}}
            Indexes.update_one(myquery,newvalues)
    break

    
