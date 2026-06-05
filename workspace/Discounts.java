// @Author: Devi Sri Ranga Prasad
import java.io.*;
import java.util.*;
import java.util.stream.*;
public class Discounts {
    static final long MOD = (long)1e9+7;


    static final int spfN=(int)1e6+1;

    public static void main(String[] args) throws Exception {
        Discounts o=new Discounts();
        FastScanner sc = new FastScanner();

        int t = sc.nextInt();
        while (t-- > 0) {
            int n = sc.nextInt();

            int m=sc.nextInt();

            int a[]=new int[n];

            int b[]=new int[m];

            for(int i=0;i<n;i++)a[i]=sc.nextInt();

            for(int i=0;i<m;i++)b[i]=sc.nextInt();

            
            Arrays.sort(b);

            Arrays.sort(a);

            long pref[]=new long[n];
            pref[0]=a[0];

            for(int i=1;i<n;i++){
                pref[i]=pref[i-1]+a[i];
            }

            int i=n-1;
            long ans=0;

            int j=0;
            while(i>=0 && j<m){

                int el=b[j]-1;

                if(el==0){
                    i--;
                    j++;
                    continue;
                }

                ans+=pref[i]-((i-el)<0?0:pref[i-el]);

                // println(ans);

                i=i-el-1;
                j++;
            }

            while(i>=0){
                ans+=a[i--];
            }

            println(ans);

            
            
           
        }
        flush();
    }

   // -------- FAST INPUT --------
    static class FastScanner {
        private final byte[] buffer = new byte[1 << 16];
        private int ptr = 0, len = 0;
        private final InputStream in = System.in;

        private int readByte() throws IOException {
            if (ptr >= len) {
                len = in.read(buffer);
                ptr = 0;
                if (len <= 0) return -1;
            }
            return buffer[ptr++];
        }

        byte[] nextBytes() throws IOException {
            int c;
            do {
                c = readByte();
            } while (c <= ' ');

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            while (c > ' ') {
                out.write(c);
                c = readByte();
            }
            return out.toByteArray();
        }

        String next() throws IOException {
            byte[] b = nextBytes();
            return new String(b);   // ASCII input assumed (CP standard)
        }

        byte[] nextLineBytes() throws IOException {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            int c;

            // consume any previous newline
            while (true) {
                c = readByte();
                if (c == -1 || c != '\n') break;
            }

            while (c != -1 && c != '\n') {
                out.write(c);
                c = readByte();
            }

            return out.toByteArray();
        }

        String nextLine() throws IOException {
            byte[] b = nextLineBytes();
            return new String(b);
        }


        int nextInt() throws IOException {
            int c, sign = 1, val = 0;
            do {
                c = readByte();
            } while (c <= ' ');

            if (c == '-') {
                sign = -1;
                c = readByte();
            }

            while (c > ' ') {
                val = val * 10 + (c - '0');
                c = readByte();
            }
            return val * sign;
        }

        long nextLong() throws IOException {
            int c, sign = 1;
            long val = 0;
            do {
                c = readByte();
            } while (c <= ' ');

            if (c == '-') {
                sign = -1;
                c = readByte();
            }

            while (c > ' ') {
                val = val * 10 + (c - '0');
                c = readByte();
            }
            return val * sign;
        }
    }

    // -------- FAST OUTPUT --------
    static final StringBuilder sb = new StringBuilder();
    static final BufferedOutputStream out = new BufferedOutputStream(System.out);

    static void print(int x) {
        sb.append(x);
    }

    static void println(int x) {
        sb.append(x).append('\n');
    }

    static void print(long x) {
        sb.append(x);
    }

    static void println(long x) {
        sb.append(x).append('\n');
    }

    static void print(double x) {
        sb.append(x);
    }

    static void println(double x) {
        sb.append(x).append('\n');
    }

    static void print(String s) {
        sb.append(s);
    }

    static void println(String s) {
        sb.append(s).append('\n');
    }

    static void flush() throws IOException {
        out.write(sb.toString().getBytes());
        out.flush();
        sb.setLength(0);
    }

    // -------- USAGE --------


    // Helper class

    /* ================== NORMALIZATION ================== */
    /* Brings any number into [0, MOD) */
    static long norm(long x) {
        x %= MOD;
        if (x < 0) x += MOD;
        return x;
    }

    /* ================== BASIC OPS ================== */

    static long add(long a, long b) {
        a = norm(a);
        b = norm(b);
        a += b;
        if (a >= MOD) a -= MOD;
        return a;
    }

    static long sub(long a, long b) {
        a = norm(a);
        b = norm(b);
        a -= b;
        if (a < 0) a += MOD;
        return a;
    }

    static long mul(long a, long b) {
        return (norm(a) * norm(b)) % MOD;
    }

    /* ================== POWER ================== */

    static long pow(long a, long b) {
        long res = 1;
        a = norm(a);
        while (b > 0) {
            if ((b & 1) == 1) res = mul(res, a);
            a = mul(a, a);
            b >>= 1;
        }
        return res;
    }

    /* ================== INVERSE ================== */
    /* MOD must be prime */
    static long inv(long a) {
        return pow(a, MOD - 2);
    }

    /* ================== DIVISION ================== */

    static long div(long a, long b) {
        return mul(a, inv(b));
    }

    /* ================== MULTI ARG MULTIPLY ================== */

    static long mulAll(long... arr) {
        long res = 1;
        for (long x : arr) {
            res = mul(res, x);
        }
        return res;
    }


    static int[] spf = new int[spfN + 1];

    static void sieve() {
        for (int i = 1; i <= spfN; i++) spf[i] = i;

        for (int i = 2; i * i <= spfN; i++) {
            if (spf[i] == i) { // prime
                for (int j = i * i; j <= spfN; j += i) {
                    if (spf[j] == j) spf[j] = i;
                }
            }
        }
    }

    static boolean isPrime(int x) {
        return x >= 2 && spf[x] == x;
    }

    static Map<Integer, Integer> factorize(int x) {
        Map<Integer, Integer> map = new HashMap<>();
        while (x > 1) {
            map.put(spf[x], map.getOrDefault(spf[x], 0) + 1);
            x /= spf[x];
        }
        return map;
    }



    static long[] prefixSum(int[] a) {
        int n = a.length;
        long[] pref = new long[n];
        for (int i = 0; i < n; i++) {
            if(i==0){
                pref[i]=a[i];
            }else{
                pref[i]=a[i]+pref[i-1];
            }
        }
        return pref;
    }

    static long gcd(long a, long b) { return b == 0 ? Math.abs(a) : gcd(b, a % b); }

    static long phi(long n, Map<Long, Integer> f) {
        long res = n;
        for (long p : f.keySet()) {
            res = res / p * (p - 1);
        }
        return res;
    }

    public static long LCM(long... a) {
        long lcm = a[0];
        
        for (int i = 1; i < a.length; i++) {
            lcm = lcm(lcm, a[i]);
        }
        
        return lcm;
    }

    private static long lcm(long x, long y) {
        return x / gcd(x, y) * y;
    }

 static class MinMaxQueue<T extends Comparable<T>> {

        private TreeMap<T, Integer> map;
        private int size;

        public MinMaxQueue() {
            map = new TreeMap<>();
            size = 0;
        }

        // INSERT
        public void add(T x) {
            map.put(x, map.getOrDefault(x, 0) + 1);
            size++;
        }

        // PEEK MIN
        public T peekFirst() {
            return map.isEmpty() ? null : map.firstKey();
        }

        // PEEK MAX
        public T peekLast() {
            return map.isEmpty() ? null : map.lastKey();
        }

        // POLL MIN
        public T pollFirst() {
            if (map.isEmpty()) return null;

            T key = map.firstKey();
            decrement(key);
            return key;
        }

        // POLL MAX
        public T pollLast() {
            if (map.isEmpty()) return null;

            T key = map.lastKey();
            decrement(key);
            return key;
        }

        // INTERNAL REMOVE
        private void decrement(T key) {
            int count = map.get(key);

            if (count == 1) map.remove(key);
            else map.put(key, count - 1);

            size--;
        }

        public int size() {
            return size;
        }

        public boolean isEmpty() {
            return size == 0;
        }

        // DEBUG STRING
        @Override
        public String toString() {
            StringBuilder sb = new StringBuilder();
            sb.append("[");

            for (Map.Entry<T, Integer> entry : map.entrySet()) {
                T key = entry.getKey();
                int freq = entry.getValue();

                for (int i = 0; i < freq; i++) {
                    sb.append(key).append(", ");
                }
            }

            if (sb.length() > 1) sb.setLength(sb.length() - 2); // remove last ", "
            sb.append("]");
            return sb.toString();
        }
    }
    static class FreqMap<T> {

        private HashMap<T, Integer> map;
        private int totalSize;

        // Constructor
        public FreqMap() {
            map = new HashMap<>();
            totalSize = 0;
        }

        // Constructor from array / collection
        public FreqMap(Collection<T> items) {
            this();
            for (T item : items) {
                add(item);
            }
        }

        // ADD (increase frequency by 1)
        public void add(T key) {
            map.put(key, map.getOrDefault(key, 0) + 1);
            totalSize++;
        }

        // ADD with custom frequency
        public void add(T key, int freq) {
            if (freq <= 0) return;
            map.put(key, map.getOrDefault(key, 0) + freq);
            totalSize += freq;
        }

        // REMOVE one occurrence
        public void remove(T key) {
            if (!map.containsKey(key)) return;

            int freq = map.get(key);
            if (freq == 1) {
                map.remove(key);
            } else {
                map.put(key, freq - 1);
            }
            totalSize--;
        }

        // REMOVE all occurrences
        public void removeAll(T key) {
            if (!map.containsKey(key)) return;

            totalSize -= map.get(key);
            map.remove(key);
        }

        // CONTAINS
        public boolean contains(T key) {
            return map.containsKey(key);
        }

        // GET frequency
        public int getFreq(T key) {
            return map.getOrDefault(key, 0);
        }

        // SIZE = sum of frequencies
        public int size() {
            return totalSize;
        }

        // UNIQUE keys count
        public int uniqueSize() {
            return map.size();
        }

        // CLEAR
        public void clear() {
            map.clear();
            totalSize = 0;
        }

        // toString
        @Override
        public String toString() {
            StringBuilder sb = new StringBuilder();
            sb.append("[");

            boolean first = true;

            for (Map.Entry<T, Integer> entry : map.entrySet()) {
                T key = entry.getKey();
                int freq = entry.getValue();

                for (int i = 0; i < freq; i++) {
                    if (!first) sb.append(", ");
                    sb.append(key);
                    first = false;
                }
            }

            sb.append("]");
            return sb.toString();
        }
    }

}
