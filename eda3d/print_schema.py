def print_schema(obj,depth):
    if type(obj)==list:
        print('\t'*depth,'list')
        print_schema(obj[0],depth+1)
    elif type(obj)==dict:
        print('\t'*depth,'dict')
        depth=depth+1
        for k in obj:
            print('\t'*depth,k,end=": ")
            if type(obj[k]) in [str,int,float,type(None)]:
                print(type(obj[k]))
            else:
                print()
                print_schema(obj[k],depth+1)
    else:
        print('\t'*depth,type(obj))
